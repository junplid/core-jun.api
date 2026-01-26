import cron from "node-cron";
import { prisma } from "../../adapters/Prisma/client";
import {
  cacheFlowsMap,
  chatbotRestartInDate,
  leadAwaiting,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import momentLib from "moment-timezone";

cron.schedule("*/1 * * * *", () => {
  (async () => {
    try {
      const followUps = await prisma.followUp.findMany({
        where: {
          notify_at: { lt: new Date() },
          deleted: false,
          status: "pending",
        },
        select: {
          id: true,
          body: true,
          code: true,
          accountId: true,
          FlowState: {
            select: {
              id: true,
              chatbotId: true,
              campaignId: true,
              flowId: true,
              ConnectionWA: { select: { number: true, id: true } },
              previous_response_id: true,
              ContactsWAOnAccount: {
                select: {
                  id: true,
                  ContactsWA: { select: { completeNumber: true } },
                },
              },
              Chatbot: {
                select: {
                  TimeToRestart: { select: { type: true, value: true } },
                },
              },
            },
          },
          flowNodeId: true,
        },
      });
      if (followUps.length) {
        followUps.forEach(async ({ FlowState, ...followup }) => {
          if (!FlowState.flowId || !FlowState.ConnectionWA) {
            await prisma.followUp.update({
              where: { id: followup.id },
              data: { status: "failed" },
            });
            return;
          }

          await prisma.followUp.update({
            where: { id: followup.id },
            data: { status: "sent" },
          });

          let flow: any = null;
          flow = cacheFlowsMap.get(FlowState.flowId);
          if (!flow) {
            await mongo();
            const flowFetch = await ModelFlows.aggregate([
              {
                $match: {
                  accountId: followup.accountId,
                  _id: FlowState.flowId,
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
            if (!flowFetch?.length) {
              await prisma.followUp.update({
                where: { id: followup.id },
                data: { status: "failed" },
              });
              return;
            }
            const { edges, nodes, businessIds } = flowFetch[0];
            flow = { edges, nodes, businessIds };
            cacheFlowsMap.set(FlowState.flowId, flow);
          }

          const pickNode = flow.nodes.find(
            (n: any) => n.id === followup.flowNodeId,
          ) as any;

          if (!pickNode) {
            await prisma.followUp.update({
              where: { id: followup.id },
              data: { status: "failed" },
            });
            return;
          }

          const nextEdgesIds = flow.edges
            .filter((f: any) => pickNode?.id === f.source)
            ?.map((nn: any) => {
              return {
                id: nn.target,
                sourceHandle: nn.sourceHandle,
              };
            });

          let nextNode: any = null;
          if (pickNode.type === "NodeAgentAI") {
            nextNode = pickNode.id;
          } else {
            nextNode = nextEdgesIds?.find((nd: any) =>
              nd.sourceHandle?.includes("follow-up"),
            );
          }
          if (nextNode) {
            const businessInfo = await prisma.connectionWA.findFirst({
              where: { id: FlowState.ConnectionWA.id },
              select: { Business: { select: { name: true } } },
            });
            const bot = sessionsBaileysWA.get(FlowState.ConnectionWA.id);

            if (
              !businessInfo?.Business ||
              !bot ||
              !FlowState.ContactsWAOnAccount
            ) {
              await prisma.followUp.update({
                where: { id: followup.id },
                data: { status: "failed" },
              });
              return;
            }

            NodeControler({
              businessName: businessInfo.Business.name,
              flowId: FlowState.flowId,
              flowBusinessIds: flow.businessIds,
              ...(pickNode.type === "NodeAgentAI"
                ? {
                    type: "running",
                    action: `Follow-up executado: ${followup.body}`,
                    message: `Follow-up executado: ${followup.body}`,
                  }
                : { type: "initial", action: null }),
              connectionWhatsId: FlowState.ConnectionWA.id,
              chatbotId: FlowState.chatbotId || undefined,
              campaignId: FlowState.campaignId || undefined,
              oldNodeId: nextNode.id,
              previous_response_id: FlowState.previous_response_id || undefined,
              clientWA: bot,
              isSavePositionLead: true,
              flowStateId: FlowState.id,
              contactsWAOnAccountId: FlowState.ContactsWAOnAccount.id,
              lead: {
                number:
                  FlowState.ContactsWAOnAccount!.ContactsWA.completeNumber,
              },
              currentNodeId: nextNode.id,
              edges: flow.edges,
              nodes: flow.nodes,
              numberConnection:
                FlowState.ConnectionWA.number + "@s.whatsapp.net",
              accountId: followup.accountId,
              actions: {
                onFinish: async (vl) => {
                  const scheduleExecutionCache = scheduleExecutionsReply.get(
                    FlowState.ConnectionWA!.number +
                      "@s.whatsapp.net" +
                      FlowState.ContactsWAOnAccount!.ContactsWA.completeNumber +
                      "@s.whatsapp.net",
                  );
                  if (scheduleExecutionCache) {
                    scheduleExecutionCache.cancel();
                  }
                  console.log("TA CAINDO AQUI, finalizando fluxo");
                  await prisma.flowState.update({
                    where: { id: FlowState!.id! },
                    data: { isFinish: true },
                  });
                  if (
                    FlowState!.chatbotId &&
                    FlowState!.Chatbot?.TimeToRestart
                  ) {
                    const nextDate = momentLib()
                      .tz("America/Sao_Paulo")
                      .add(
                        FlowState!.Chatbot.TimeToRestart.value,
                        FlowState!.Chatbot.TimeToRestart.type,
                      )
                      .toDate();
                    chatbotRestartInDate.set(
                      `${FlowState.ConnectionWA!.number}+${
                        FlowState.ContactsWAOnAccount?.ContactsWA.completeNumber
                      }`,
                      nextDate,
                    );
                  }
                },
                onExecutedNode: async (node) => {
                  await prisma.flowState
                    .update({
                      where: { id: FlowState!.id },
                      data: { indexNode: node.id },
                    })
                    .catch((err) => console.log(err));
                },
                onEnterNode: async (node) => {
                  const indexCurrentAlreadyExist =
                    await prisma.flowState.findFirst({
                      where: {
                        connectionWAId: FlowState.ConnectionWA?.id,
                        contactsWAOnAccountId:
                          FlowState.ContactsWAOnAccount?.id,
                      },
                      select: { id: true },
                    });
                  if (!indexCurrentAlreadyExist) {
                    await prisma.flowState.create({
                      data: {
                        indexNode: node.id,
                        flowId: node.flowId,
                        connectionWAId: FlowState.ConnectionWA?.id,
                        contactsWAOnAccountId:
                          FlowState.ContactsWAOnAccount?.id,
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
                `${FlowState.ConnectionWA?.id}+${FlowState.ContactsWAOnAccount?.ContactsWA.completeNumber}`,
                false,
              );
            });
          }
        });
      }
    } catch (err) {
      console.error("Erro na execução async:", err);
    }
  })();
});
