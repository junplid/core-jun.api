import { Request, Response } from "express";
import crypto from "crypto";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "../../adapters/Prisma/client";
import { PaymentStatus } from "@prisma/client";
import {
  cacheFlowsMap,
  chatbotRestartInDate,
  leadAwaiting,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { mongo } from "../../adapters/mongo/connection";
import { NotificationApp } from "../../utils/notificationApp";
import { formatToBRL } from "brazilian-values";
import { decrypte } from "../../libs/encryption";
import moment from "moment-timezone";

export const mercadopagoWebhook = async (req: Request, res: Response) => {
  try {
    if (req.body.action !== "payment.updated") {
      return res.status(200).send("OK");
    }
    const paymentId = req.body.data.id;
    console.log({ paymentId });
    if (!paymentId) {
      return res.status(400).send("Missing payload.data.id");
    }
    console.log(1);
    const getCredentials = await prisma.charges.findFirst({
      where: { txid: paymentId },
      select: { PaymentIntegration: { select: { credentials: true } } },
    });
    console.log(2);
    if (!getCredentials || !getCredentials.PaymentIntegration) {
      return res.status(200).send("OK");
    }
    console.log(3);
    const credentials = decrypte(
      getCredentials.PaymentIntegration?.credentials,
    );
    console.log(4);
    const xSignature = req.header("x-signature");
    const xRequestId = req.header("x-request-id");
    if (!xSignature || !xRequestId) {
      return res.status(400).send("Headers missing");
    }
    console.log(5);
    const parts = xSignature.split(",");
    let ts: string | undefined;
    let signatureHash: string | undefined;
    for (const part of parts) {
      const [key, val] = part.trim().split("=");
      if (key === "ts") ts = val;
      else if (key === "v1") signatureHash = val;
    }
    if (!ts || !signatureHash) {
      return res.status(400).send("Invalid x-signature format");
    }
    console.log(6);

    const manifest = `id:${paymentId};request-id:${xRequestId};ts:${ts};`;

    const hmac = crypto.createHmac("sha256", credentials.webhook_secret);
    hmac.update(manifest);
    const computedHash = hmac.digest("hex");

    const received = Buffer.from(signatureHash, "hex");
    const expected = Buffer.from(computedHash, "hex");
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(401).send("Invalid signature");
    }
    console.log(7);

    // const nowSec = Math.floor(Date.now() / 1000);
    // const tsSec = Math.floor(parseInt(ts, 10) / 1000);
    // const tolerance = 5 * 60; // 5 minutos
    // if (Math.abs(nowSec - tsSec) > tolerance) {
    //   return res.status(400).send("Timestamp outside of tolerance");
    // }

    console.log("2");

    (async () => {
      try {
        const getCharge = await prisma.charges.findFirst({
          where: { txid: paymentId },
          select: {
            id: true,
            accountId: true,
            status: true,
            flowNodeId: true,
            flowStateId: true,
            total: true,
          },
        });

        if (!getCharge) return;

        const client = new MercadoPagoConfig({
          accessToken: credentials.access_token,
          options: { timeout: 5000 },
        });

        const getpayment = new Payment(client);
        const payment = await getpayment.get({ id: paymentId });
        console.log("3");

        if (payment.status === getCharge.status) return;
        console.log("4");

        if (payment.status === "pending") return;
        console.log("5");

        await prisma.charges.update({
          where: { id: getCharge.id },
          data: {
            status: payment.status as PaymentStatus,
            net_total: payment.net_amount || 0,
          },
        });
        console.log("6");

        if (!getCharge.flowStateId) return;

        const flowState = await prisma.flowState.findFirst({
          where: { id: getCharge.flowStateId },
          select: {
            flowId: true,
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
            Chatbot: {
              select: {
                id: true,
                TimeToRestart: {
                  select: { value: true, type: true },
                },
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
          (n: any) => n.id === getCharge.flowNodeId,
        );

        if (!chargeNode) return;

        const nextEdgesIds = flow.edges
          .filter((f: any) => chargeNode?.id === f.source)
          ?.map((nn: any) => {
            return {
              id: nn.target,
              sourceHandle: nn.sourceHandle,
            };
          });

        let nextNode: any = null;
        if (chargeNode.type === "NodeAgentAI") {
          nextNode = chargeNode.id;
        } else {
          nextNode = nextEdgesIds?.find((nd: any) =>
            nd.sourceHandle?.includes(payment.status),
          );
        }

        if (payment.status === "approved") {
          await NotificationApp({
            accountId: getCharge.accountId,
            title_txt: `Pagamento confirmado`,
            title_html: `Pagamento confirmado`,
            body_txt: `Valor: ${formatToBRL(getCharge.total.toNumber())}`,
            body_html: `<span className="font-medium text-sm line-clamp-1">
  Pagamento confirmado
</span>
<span className="text-xs font-light">
  Valor: <span className="text-green-300 font-medium">${formatToBRL(
    getCharge.total.toNumber(),
  )}</span>
</span>`,
            onFilterSocket: (sockets) => [],
          });
        }

        if (!nextNode) return;
        const bot = sessionsBaileysWA.get(flowState.ConnectionWA.id);
        if (!bot) return;
        await NodeControler({
          businessName: flowState.ConnectionWA.Business.name,
          flowId: flowState.flowId,
          flowBusinessIds: flow.businessIds,
          ...(chargeNode.type === "NodeAgentAI"
            ? {
                type: "running",
                action: `Cobrança(codigo=${paymentId}), atualizada para: ${payment.status}`,
                message: `Cobrança(codigo=${paymentId}), atualizada para: ${payment.status}`,
              }
            : { type: "initial", action: null }),
          connectionWhatsId: flowState.ConnectionWA.id,
          chatbotId: flowState.Chatbot?.id || undefined,
          campaignId: flowState.campaignId || undefined,
          oldNodeId: nextNode.id,
          previous_response_id: flowState.previous_response_id || undefined,
          clientWA: bot,
          isSavePositionLead: true,
          flowStateId: getCharge.flowStateId,
          contactsWAOnAccountId: flowState.ContactsWAOnAccount.id,
          lead: {
            number: flowState.ContactsWAOnAccount.ContactsWA.completeNumber,
          },
          currentNodeId: nextNode.id,
          edges: flow.edges,
          nodes: flow.nodes,
          numberConnection: flowState.ConnectionWA.number + "@s.whatsapp.net",
          accountId: getCharge.accountId,
          actions: {
            onFinish: async (vl) => {
              const scheduleExecutionCache = scheduleExecutionsReply.get(
                flowState.ConnectionWA!.number +
                  "@s.whatsapp.net" +
                  flowState.ContactsWAOnAccount!.ContactsWA.completeNumber +
                  "@s.whatsapp.net",
              );
              if (scheduleExecutionCache) scheduleExecutionCache.cancel();
              console.log("TA CAINDO AQUI, finalizando fluxo");
              await prisma.flowState.update({
                where: { id: getCharge.flowStateId! },
                data: { isFinish: true },
              });
              if (flowState.Chatbot?.id && flowState.Chatbot?.TimeToRestart) {
                const nextDate = moment()
                  .tz("America/Sao_Paulo")
                  .add(
                    flowState!.Chatbot.TimeToRestart.value,
                    flowState!.Chatbot.TimeToRestart.type,
                  )
                  .toDate();
                chatbotRestartInDate.set(
                  `${flowState.ConnectionWA!.number}+${
                    flowState.ContactsWAOnAccount?.ContactsWA.completeNumber
                  }`,
                  nextDate,
                );
              }
            },
            onExecutedNode: async (node) => {
              await prisma.flowState
                .update({
                  where: { id: getCharge.flowStateId! },
                  data: { indexNode: node.id },
                })
                .catch((err) => console.log(err));
            },
            onEnterNode: async (node) => {
              const indexCurrentAlreadyExist = await prisma.flowState.findFirst(
                {
                  where: {
                    connectionWAId: flowState.ConnectionWA?.id,
                    contactsWAOnAccountId: flowState.ContactsWAOnAccount?.id,
                  },
                  select: { id: true },
                },
              );
              if (!indexCurrentAlreadyExist) {
                await prisma.flowState.create({
                  data: {
                    indexNode: node.id,
                    flowId: node.flowId,
                    connectionWAId: flowState.ConnectionWA?.id,
                    contactsWAOnAccountId: flowState.ContactsWAOnAccount?.id,
                  },
                });
              } else {
                await prisma.flowState.update({
                  where: { id: indexCurrentAlreadyExist.id },
                  data: {
                    indexNode: node.id,
                    flowId: node.flowId,
                    agentId: node.agentId || null,
                  },
                });
              }
            },
          },
        }).finally(() => {
          leadAwaiting.set(
            `${flowState.ConnectionWA!.id}+${flowState.ContactsWAOnAccount!.ContactsWA.completeNumber}`,
            false,
          );
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
