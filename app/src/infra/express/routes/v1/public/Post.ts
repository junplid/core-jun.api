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
import { webhookMercadopago } from "../../../../../core/webhookMercadopago";
import { registerIntentValidation } from "../../../../../core/registerIntent/Validation";
import { registerIntentController } from "../../../../../core/registerIntent";
import { prisma } from "../../../../../adapters/Prisma/client";
import { cacheFlowsMap } from "../../../../../adapters/Baileys/Cache";
import { ModelFlows } from "../../../../../adapters/mongo/models/flows";
import { NodeControler } from "../../../../../libs/FlowBuilder/Control";
import { sessionsBaileysWA } from "../../../../../adapters/Baileys";

const RouterV1Public_Post = Router();

RouterV1Public_Post.post(
  "/register/intent",
  registerIntentValidation,
  registerIntentController
);

RouterV1Public_Post.post(
  "/register/account",
  createAccountValidation,
  createAccountController
);

RouterV1Public_Post.post(
  "/login-account",
  loginAccountValidation,
  loginAccountController
);

RouterV1Public_Post.post("/login", loginRootValidation, loginRootController);

RouterV1Public_Post.post(
  "/register-root",
  createRootValidation,
  createRootController
);

RouterV1Public_Post.post(
  "/send-password-recovery-email/:type",
  sendPasswordRecoveryEmailValidation,
  sendPasswordRecoveryEmailController
);

RouterV1Public_Post.post("/webhook/mercadopago", webhookMercadopago);

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
          previous_response_id: true,
          chatbotId: true,
          campaignId: true,
        },
      });

      if (
        !getFlowState?.flowId ||
        !getFlowState.ContactsWAOnAccount ||
        !getFlowState.ConnectionWA
      )
        return;
      const botwa = sessionsBaileysWA.get(getFlowState.ConnectionWA.id);
      if (!botwa) return;

      let flow:
        | { edges: any[]; nodes: any[]; businessIds: number[] }
        | undefined;
      flow = cacheFlowsMap.get(getFlowState.flowId);
      if (!flow) {
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
        (n: any) => n.type === "NodeWebhookTrelloCard"
      ) as any[];
      if (!nodes?.length) return;

      const numberLead =
        getFlowState.ContactsWAOnAccount.ContactsWA.completeNumber;

      for await (const node of nodes) {
        await new Promise<void>(async (res, rej) => {
          await NodeControler({
            forceFinish: true,
            businessName: getFlowState.ConnectionWA!.Business.name,
            flowId: getFlowState.flowId!,
            flowBusinessIds: flow.businessIds,
            type: "running",
            afterName,
            beforeName,
            cardId,
            connectionWhatsId: getFlowState.ConnectionWA!.id,
            campaignId: getFlowState.campaignId || undefined,
            chatbotId: getFlowState.chatbotId || undefined,
            oldNodeId: node.id,
            currentNodeId: node.id,
            clientWA: botwa,
            isSavePositionLead: false,
            message: "",
            previous_response_id:
              getFlowState.previous_response_id || undefined,
            flowStateId: flowStateId,
            contactsWAOnAccountId: getFlowState.ContactsWAOnAccount!.id,
            lead: { number: numberLead! + "@s.whatsapp.net" },
            edges: flow!.edges,
            nodes: flow!.nodes,
            numberConnection:
              getFlowState.ConnectionWA!.number + "@s.whatsapp.net",
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

export default RouterV1Public_Post;
