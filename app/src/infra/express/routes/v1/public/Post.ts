import { Request, Response, Router } from "express";
import { createAccountController } from "../../../../../core/createAccount";
import { createAccountValidation } from "../../../../../core/createAccount/Validation";
import { loginAccountController } from "../../../../../core/loginAccount";
import { loginAccountValidation } from "../../../../../core/loginAccount/Validation";
import { sendPasswordRecoveryEmailController } from "../../../../../core/sendPasswordRecoveryEmail";
import { sendPasswordRecoveryEmailValidation } from "../../../../../core/sendPasswordRecoveryEmail/Validation";
import { loginRootValidation } from "../../../../../core/loginRoot/Validation";
import { loginRootController } from "../../../../../core/loginRoot";
import { createRootValidation } from "../../../../../core/createRoot/Validation";
import { createRootController } from "../../../../../core/createRoot";
import { mercadopagoWebhook } from "../../../../../core/webhookMercadopago";
// import { registerIntentValidation } from "../../../../../core/registerIntent/Validation";
// import { registerIntentController } from "../../../../../core/registerIntent";
import { prisma } from "../../../../../adapters/Prisma/client";
import {
  cacheConnectionsWAOnline,
  cacheFlowsMap,
} from "../../../../../adapters/Baileys/Cache";
import { ModelFlows } from "../../../../../adapters/mongo/models/flows";
import {
  IPropsControler,
  NodeControler,
} from "../../../../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../../../../adapters/Baileys";
import { createMenuOnlineOrderValidation } from "../../../../../core/createMenuOnlineOrder/Validation";
import { createMenuOnlineOrderController } from "../../../../../core/createMenuOnlineOrder";
import { mongo } from "../../../../../adapters/mongo/connection";
import { itauPixWebhook } from "../../../../../services/itau/itau.pix.webhook";
import { metaWebhook } from "../../../../../services/meta/meta.webhook";
import { decrypte } from "../../../../../libs/encryption";

const RouterV1Public_Post = Router();

// RouterV1Public_Post.post(
//   "/register/intent",
//   registerIntentValidation,
//   registerIntentController
// );

RouterV1Public_Post.post(
  "/register/account",
  createAccountValidation,
  createAccountController,
);

RouterV1Public_Post.post(
  "/login-account",
  loginAccountValidation,
  loginAccountController,
);

RouterV1Public_Post.post("/login", loginRootValidation, loginRootController);

RouterV1Public_Post.post(
  "/register-root",
  createRootValidation,
  createRootController,
);

RouterV1Public_Post.post(
  "/send-password-recovery-email/:type",
  sendPasswordRecoveryEmailValidation,
  sendPasswordRecoveryEmailController,
);

RouterV1Public_Post.post(
  "/menu/:uuid/order",
  createMenuOnlineOrderValidation,
  createMenuOnlineOrderController,
);

RouterV1Public_Post.post("/webhook/mercadopago", mercadopagoWebhook);
RouterV1Public_Post.post("/webhook/itau", itauPixWebhook);

RouterV1Public_Post.post("/webhook/trello", (req: Request, res: Response) => {
  const action = req.body.action;
  if (action.type !== "updateCard") {
    return res.sendStatus(200);
  }

  const data = action.data;

  const cardId: string = data.card?.id;
  let beforeName: string | undefined;
  let afterName: string | undefined;

  if (data.listBefore && data.listAfter) {
    beforeName = data.listBefore.name;
    afterName = data.listAfter.name;
  } else if (data.old && data.old.idBoard) {
    beforeName = data.old.idBoard;
    afterName = data.board?.id;
  }

  if (cardId && beforeName && afterName) {
    (async () => {
      const { flowStateId: flowSId, nodeId, ac } = req.query || {};
      if (!flowSId || !nodeId) return;

      const flowStateId = Number(flowSId);
      const accountId = Number(ac);
      if (isNaN(flowStateId) || isNaN(accountId)) return;

      const getFlowState = await prisma.flowState.findFirst({
        where: { id: flowStateId, ContactsWAOnAccount: { accountId } },
        select: {
          flowId: true,
          ContactsWAOnAccount: {
            select: {
              id: true,
              ContactsWA: { select: { completeNumber: true } },
            },
          },
          ConnectionWA: {
            select: {
              id: true,
              Business: { select: { name: true, id: true } },
              number: true,
            },
          },
          ConnectionIg: {
            select: {
              id: true,
              credentials: true,
              Business: { select: { name: true, id: true } },
            },
          },
          previous_response_id: true,
          chatbotId: true,
          campaignId: true,
        },
      });

      if (!getFlowState?.flowId || !getFlowState.ContactsWAOnAccount) {
        return;
      }

      let external_adapter: (any & { businessName: string }) | null = null;

      if (getFlowState.ConnectionWA?.id) {
        let attempt = 0;
        const botOnline = new Promise<boolean>((resolve, reject) => {
          function run() {
            if (attempt >= 5) {
              return resolve(false);
            } else {
              setInterval(async () => {
                const botWA = cacheConnectionsWAOnline.get(
                  getFlowState!.ConnectionWA?.id!,
                );
                if (!botWA) {
                  attempt++;
                  return run();
                } else {
                  return resolve(botWA);
                }
              }, 1000 * attempt);
            }
          }
          return run();
        });

        if (!botOnline) return;

        const clientWA = sessionsBaileysWA.get(getFlowState.ConnectionWA?.id!)!;
        external_adapter = {
          type: "baileys",
          clientWA: clientWA,
          businessName: getFlowState.ConnectionWA.Business.name,
        };
      }
      if (getFlowState.ConnectionIg?.id) {
        try {
          const credential = decrypte(getFlowState.ConnectionIg.credentials);
          external_adapter = {
            type: "instagram",
            page_token: credential.account_access_token,
            businessName: getFlowState.ConnectionIg.Business.name,
          };
        } catch (error) {
          return;
        }
      }

      if (!external_adapter) return;

      const connectionId = (getFlowState.ConnectionWA?.id ||
        getFlowState.ConnectionIg?.id)!;

      const businessId = (getFlowState.ConnectionWA?.Business.id ||
        getFlowState.ConnectionIg?.Business.id)!;

      let flow:
        | { edges: any[]; nodes: any[]; businessIds: number[] }
        | undefined;
      flow = cacheFlowsMap.get(getFlowState.flowId);
      if (!flow) {
        await mongo();
        const flowFetch = await ModelFlows.aggregate([
          {
            $match: {
              accountId,
              _id: getFlowState.flowId,
            },
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
        if (!flowFetch?.length) return console.log(`Flow not found.`);
        const { edges, nodes, businessIds } = flowFetch[0];
        flow = { edges, nodes, businessIds };
        cacheFlowsMap.set(getFlowState.flowId, flow);
      }

      const nodes = flow.nodes.filter(
        (n: any) => n.type === "NodeWebhookTrelloCard",
      ) as any[];
      if (!nodes?.length) return;

      const numberLead =
        getFlowState.ContactsWAOnAccount.ContactsWA.completeNumber;

      for await (const node of nodes) {
        await new Promise<void>(async (res, rej) => {
          await NodeControler({
            forceFinish: true,
            action: null,
            mode: "prod",
            businessName: external_adapter.businessName,
            flowId: getFlowState.flowId!,
            flowBusinessIds: flow.businessIds,
            type: "running",
            afterName,
            beforeName,
            cardId,
            businessId,

            external_adapter,
            connectionId,
            lead_id: numberLead,
            contactAccountId: getFlowState.ContactsWAOnAccount!.id,

            campaignId: getFlowState.campaignId || undefined,
            chatbotId: getFlowState.chatbotId || undefined,
            oldNodeId: node.id,
            currentNodeId: node.id,
            isSavePositionLead: false,
            message: "",
            previous_response_id:
              getFlowState.previous_response_id || undefined,
            flowStateId: flowStateId,
            edges: flow!.edges,
            nodes: flow!.nodes,
            accountId,
            actions: {
              onFinish: async () => res(),
              onErrorClient: async (err) => res(),
              onErrorNumber: async () => res(),
            },
          });
        });
      }
    })();
  }

  res.sendStatus(200);
});

RouterV1Public_Post.post("/meta/webhook", metaWebhook);

export default RouterV1Public_Post;
