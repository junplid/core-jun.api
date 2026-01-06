import { Request, Response } from "express";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "../../adapters/Prisma/client";
import { PaymentStatus } from "@prisma/client";
import { cacheFlowsMap } from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { mongo } from "../../adapters/mongo/connection";
import { NotificationApp } from "../../utils/notificationApp";
import { formatToBRL } from "brazilian-values";

export const webhookMercadopago = async (req: Request, res: Response) => {
  try {
    // const xSignature = req.header("x-signature");
    // const xRequestId = req.header("x-request-id");
    // if (!xSignature || !xRequestId) {
    //   return res.status(400).send("Headers missing");
    // }

    // const parts = xSignature.split(",");
    // let ts: string | undefined;
    // let signatureHash: string | undefined;
    // for (const part of parts) {
    //   const [key, val] = part.trim().split("=");
    //   if (key === "ts") ts = val;
    //   else if (key === "v1") signatureHash = val;
    // }
    // if (!ts || !signatureHash) {
    //   return res.status(400).send("Invalid x-signature format");
    // }

    // const payload = req.body;
    // if (!payload?.data?.id) {
    //   return res.status(400).send("Missing payload.data.id");
    // }

    // const manifest = `id:${payload.id};request-id:${xRequestId};ts:${ts};`;

    // // aqui precisa pegar o access_token do adm
    // const secret = process.env.!;
    // const hmac = crypto.createHmac("sha256", secret);
    // hmac.update(manifest);
    // const computedHash = hmac.digest("hex");

    // const received = Buffer.from(signatureHash, "hex");
    // const expected = Buffer.from(computedHash, "hex");
    // if (
    //   received.length !== expected.length ||
    //   !crypto.timingSafeEqual(received, expected)
    // ) {
    //   return res.status(401).send("Invalid signature");
    // }

    // const nowSec = Math.floor(Date.now() / 1000);
    // const tsSec = parseInt(ts, 10);
    // const tolerance = 5 * 60; // 5 minutos
    // if (Math.abs(nowSec - tsSec) > tolerance) {
    //   return res.status(400).send("Timestamp outside of tolerance");
    // }

    console.log(req.body);
    if (req.body.action !== "payment.updated") {
      return res.status(200).send("OK");
    }

    const paymentId = req.body.data.id;
    if (!paymentId) {
      return res.status(400).send("Missing payment ID");
    }

    (async () => {
      try {
        const getCharge = await prisma.charges.findFirst({
          where: { transactionId: paymentId },
          select: {
            id: true,
            accountId: true,
            status: true,
            flowNodeId: true, // continuar daqui no canal de status
            flowStateId: true,
            PaymentIntegration: { select: { access_token: true } },
            total: true,
          },
        });

        if (!getCharge?.PaymentIntegration) return;

        const client = new MercadoPagoConfig({
          accessToken: getCharge.PaymentIntegration.access_token,
          options: { timeout: 5000 },
        });

        const getpayment = new Payment(client);
        const payment = await getpayment.get({ id: paymentId });

        // garante que seja um status diferente antes de atualizar e chamar o fluxo
        if (payment.status === getCharge.status) return;

        await prisma.charges.update({
          where: { id: getCharge.id },
          data: {
            status: payment.status as PaymentStatus,
            net_total: payment.net_amount || 0,
          },
        });

        if (!getCharge.flowStateId) return;

        const flowState = await prisma.flowState.findFirst({
          where: { id: getCharge.flowStateId },
          select: {
            flowId: true,
            chatbotId: true,
            previous_response_id: true,
            ContactsWAOnAccount: {
              select: {
                id: true,
                ContactsWA: { select: { completeNumber: true } },
              },
            },
            campaignId: true,
            ConnectionWA: {
              select: {
                id: true,
                number: true,
                Business: { select: { name: true } },
              },
            },
          },
        });

        if (
          !flowState ||
          !flowState.flowId ||
          !flowState.ConnectionWA ||
          !flowState.ContactsWAOnAccount
        ) {
          return;
        }

        let flow:
          | { edges: any[]; nodes: any[]; businessIds: number[] }
          | undefined;
        flow = cacheFlowsMap.get(flowState.flowId);

        if (!flow) {
          await mongo();
          const flowFetch = await ModelFlows.aggregate([
            {
              $match: { accountId: getCharge.accountId, _id: flowState.flowId },
            },
            {
              $project: {
                businessIds: 1,
                nodes: {
                  $map: {
                    input: "$data.nodes",
                    in: {
                      id: "$$this.id",
                      type: "$$this.type",
                      data: "$$this.data",
                    },
                  },
                },
                edges: {
                  $map: {
                    input: "$data.edges",
                    in: {
                      id: "$$this.id",
                      source: "$$this.source",
                      target: "$$this.target",
                      sourceHandle: "$$this.sourceHandle",
                    },
                  },
                },
              },
            },
          ]);
          if (!flowFetch?.length) return;

          const { edges, nodes, businessIds } = flowFetch[0];
          flow = { edges, nodes, businessIds };
          cacheFlowsMap.set(flowState.flowId, flow);
        }

        const chargeNode = flow.nodes.find(
          (n: any) => n.id === getCharge.flowNodeId
        ) as any[];

        if (!chargeNode) return;

        if (payment.status === "pending") return;

        const nextNode = flow.edges.find((e: any) => {
          if (e.sourceHandle.includes(payment.status)) {
            console.log({ e, nodeId: getCharge.flowNodeId });
            return e.source === getCharge.flowNodeId;
          }
        });

        if (nextNode.sourceHandle.includes("approved")) {
          await NotificationApp({
            accountId: getCharge.accountId,
            title_txt: `Venda confirmada`,
            title_html: `Venda confirmada`,
            body_txt: `Valor: ${formatToBRL(getCharge.total.toNumber())}`,
            body_html: `<span className="font-medium text-sm line-clamp-1">
  Venda confirmada
</span>
<span className="text-xs font-light">
  Valor: <span className="text-green-300 font-medium">${formatToBRL(
    getCharge.total.toNumber()
  )}</span>
</span>`,

            // notificar apenas o android
            onFilterSocket: (sockets) => [],
          });
        }

        console.log("18");
        if (!nextNode) return;
        console.log("19");
        const bot = sessionsBaileysWA.get(flowState.ConnectionWA.id);
        if (!bot) return;
        console.log("20");
        await NodeControler({
          action: null,
          businessName: flowState.ConnectionWA.Business.name,
          flowId: flowState.flowId,
          flowBusinessIds: flow.businessIds,
          type: "initial",
          connectionWhatsId: flowState.ConnectionWA.id,
          chatbotId: flowState.chatbotId || undefined,
          campaignId: flowState.campaignId || undefined,
          oldNodeId: nextNode.target,
          previous_response_id: flowState.previous_response_id || undefined,
          clientWA: bot,
          isSavePositionLead: true,
          flowStateId: getCharge.flowStateId,
          contactsWAOnAccountId: flowState.ContactsWAOnAccount.id,
          lead: {
            number: flowState.ContactsWAOnAccount.ContactsWA.completeNumber,
          },
          currentNodeId: nextNode.target,
          edges: flow.edges,
          nodes: flow.nodes,
          numberConnection: flowState.ConnectionWA.number + "@s.whatsapp.net",
          accountId: getCharge.accountId,
        });
      } catch (error) {
        console.error("Error processing Mercado Pago webhook:", error);
        return;
      }
    })();

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook validation error:", err);
    return res.status(500).send("Internal error");
  }
};
