import { WASocket } from "baileys";
import moment from "moment-timezone";
import { Job, scheduleJob } from "node-schedule";
import {
  countAttemptsReply,
  flowsMap,
  isSendMessageOfFailedAttempts,
  scheduleExecutionsMenu,
  scheduleExecutionsReply,
} from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { baileysWATypingDelay } from "../../helpers/typingDelayVenom";
import { LibraryNodes } from "./Library";
import { NodeInterruption } from "./Library/Interruption";
import { createJobNodeReply } from "./Library/Reply/CreateJob";
import { NodeInterruptionData, NodePayload } from "./Payload";
import { currentNodeFlow } from "./cache";

const getNextTimeOut = (type: "MINUTES" | "HOURS" | "DAYS", value: number) => {
  if (type === "MINUTES" && value > 10080) value = 10080;
  if (type === "HOURS" && value > 168) value = 168;
  if (type === "DAYS" && value > 7) value = 7;

  const typeTimeOut = type.toLocaleLowerCase() as "minutes" | "hours" | "days";
  return new Date(moment().add(value, typeTimeOut).toString());
};

interface BetweenExecutions {
  contactId: number;
  connectionId: number;
  nodeId: string;
  interruptionForNode?(id?: string): void;
}

const betweenExecutions = async (props: BetweenExecutions) => {
  const key = `${props.contactId}-${props.connectionId}`;
  const isInterruptionNode = currentNodeFlow.get(key);
  if (!!isInterruptionNode && isInterruptionNode !== props.nodeId) {
    if (props.interruptionForNode)
      return props.interruptionForNode(isInterruptionNode);
  }
};

export type TypesNode =
  | "nodeInitial"
  | "nodeMessage"
  | "nodeReply"
  | "nodeValidation"
  | "nodeSwitch"
  | "nodeSendContact"
  | "nodeSendVideo"
  | "nodeSendPdf"
  | "nodeSendFile"
  | "nodeSendImage"
  | "nodeSendAudio"
  | "nodeSendLink"
  | "nodeMathematicalOperators"
  | "nodeCheckPoint"
  | "nodeInterruption"
  | "nodeAction"
  | "nodeEmailSending"
  | "nodeLinkTranckingPixel"
  | "nodeSendLocationGPS"
  | "nodeLogicalCondition"
  | "nodeDistributeFlow"
  | "nodeNotifyNumber"
  | "nodeSendHumanService"
  | "nodeInterruptionLinkTrackingPixel"
  | "nodeTime"
  | "nodeWebhook"
  | "nodeInsertLeaderInAudience"
  | "nodeWebform"
  | "nodeNewCardTrello"
  | "nodeAttendantAI"
  | "nodeFacebookConversions"
  | "nodeMenu";

interface Edges {
  source: string;
  target: string;
  sourceHandle: string | null;
  id: string;
}

export type PropsNodeControler = {
  onEnterNode?(nodeId: string): Promise<void>;
  onExecutedNode?(
    props: { id: string; type: TypesNode },
    isShots?: boolean
  ): void;
  onFinish?(vl?: string): Promise<void>;
  onErrorNumber?(): void;
  nodes: NodePayload[];
  ticketProtocol?: string;
  edges: Edges[];
  clientWA: WASocket;
  lead: { number: string };
  flowId: number;
  flowStateId: number;
  currentNodeId?: string;
  campaignId?: number;
  chatbotId?: number;
  connectionWhatsId: number;
  contactsWAOnAccountId: number;
  isSavePositionLead?: boolean;
  numberConnection: string;
  accountId: number;
  businessName: string;
} & (
  | { type: "initial" }
  | {
      type: "running";
      message: string;
      isMidia?: boolean;
    }
);

export const NodeControler = ({
  currentNodeId = "0",
  ...propsC
}: PropsNodeControler): Promise<void> => {
  return new Promise((res, rej) => {
    const execute = async (
      props: PropsNodeControler & { currentNodeId: string }
    ): Promise<void> => {
      const keyMap = props.numberConnection + props.lead.number;

      // verifico se essa campanha está pausada ou finalizada
      // seria melhor que essa responsabilidade ficasse em outra camada
      // deixando então aqui no controlador tudo que é ligado a bloco-node
      if (props.chatbotId) {
        await new Promise<void>(async (resP, rejP) => {
          async function verify() {
            const chatbot = await prisma.chatbot.findFirst({
              where: { id: props.chatbotId },
              select: {
                interrupted: true,
                Business: { select: { interrupted: true } },
                ConnectionOnBusiness: { select: { interrupted: true } },
              },
            });

            if (!chatbot) return rejP();
            if (chatbot.interrupted) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }
            if (chatbot.Business.interrupted) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }
            if (!chatbot.ConnectionOnBusiness) {
              return rejP();
            }
            if (chatbot.ConnectionOnBusiness.interrupted) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }
            return resP();
          }
          verify();
        }).catch(() => {
          console.log("Error, chatbot não encontrado!");
          return rej();
        });
      }

      if (props.campaignId) {
        await new Promise<void>(async (resP, rejP) => {
          async function verify() {
            const campaign = await prisma.campaign.findFirst({
              where: { id: props.campaignId },
              select: {
                interrupted: true,
                CampaignOnBusiness: {
                  select: {
                    ConnectionOnCampaign: {
                      where: {
                        connectionOnBusinessId: props.connectionWhatsId,
                      },
                      select: {
                        ConnectionOnBusiness: { select: { interrupted: true } },
                      },
                    },
                    Business: { select: { interrupted: true } },
                  },
                },
              },
            });

            if (!campaign) return rejP();

            const allBusinessInterruped = campaign.CampaignOnBusiness.map(
              (s) => s.Business.interrupted
            ).every((s) => s);

            if (allBusinessInterruped) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }
            if (campaign.interrupted) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }

            const allConnectionsInterruped = campaign.CampaignOnBusiness.map(
              (s) => {
                return s.ConnectionOnCampaign.map(
                  (v) => v.ConnectionOnBusiness.interrupted
                );
              }
            )
              .flat()
              .every((s) => s);

            if (allConnectionsInterruped) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }

            return resP();
          }
          verify();
        }).catch(() => {
          console.log("Error, campanha não encontrada!");
          return rej();
        });

        const findCampaign = await prisma.campaign.count({
          where: {
            id: props.campaignId,
            status: { in: ["paused", "finished"] },
          },
        });

        if (findCampaign) {
          return props.onFinish && (await props.onFinish("112"));
        }
      }

      const currentNode = props.nodes.find((f) => f.id === props.currentNodeId);

      const nextEdgesIds = props.edges
        .filter((f) => currentNode?.id === f.source)
        ?.map((nn) => {
          const node = props.nodes.find((f) => f.id === nn.target);
          return {
            id: nn.target,
            sourceHandle: nn.sourceHandle,
            nodeNextType: node?.type,
          };
        });

      if (!currentNode) {
        props.onFinish && (await props.onFinish("110"));
        return res();
      }

      // if (props.type === "running") {
      //   const nodesInterruption = props.nodes.filter(
      //     (noI) => noI.type === "nodeInterruption"
      //   ) as { data: NodeInterruptionData }[];
      //   await NodeInterruption({
      //     message: props.message,
      //     data: nodesInterruption.map((nod) => nod.data),
      //     connectionWhatsId: props.connectionWhatsId,
      //     contactsWAOnAccountId: props.contactsWAOnAccountId,
      //   })
      //     .then(async ({ handleId }) => {
      //       if (handleId) {
      //         if (props.onExecutedNode) props.onExecutedNode(currentNode);
      //         if (!handleId) return;

      //         if (!nextEdgesIds.length) {
      //           props.onFinish && (await props.onFinish("125"));
      //           return res();
      //         }

      //         const nextEdge = props.edges.find(
      //           (n) => n.sourceHandle === handleId
      //         );

      //         if (!nextEdge) {
      //           props.onFinish && (await props.onFinish("134"));
      //           return res();
      //         }

      //         const targetNode = props.nodes.find(
      //           (f) => f.id === nextEdge.target
      //         );

      //         if (!targetNode) {
      //           props.onFinish && (await props.onFinish("280"));
      //           return res();
      //         }

      //         const key = `${props.contactsWAOnAccountId}-${props.connectionWhatsId}`;
      //         currentNodeFlow.set(key, targetNode.id);

      //         const isDepend = targetNode.type === "nodeReply";
      //         if (isDepend) return res();

      //         console.log("Vai executar o node", { targetNode });

      //         return execute({
      //           ...props,
      //           type: "initial",
      //           currentNodeId: targetNode.id,
      //           onExecutedNode: ({ id }) => {
      //             console.log("NODE EXECUTOU");
      //             // interruptRequest.delete(key);
      //           },
      //         });
      //       } else {
      //         return;
      //       }
      //     })
      //     .catch((error) => {
      //       console.log("Error node interruption", error);
      //       props.onErrorNumber && props.onErrorNumber();
      //       return res();
      //     });
      // }
      if (currentNode.type === "nodeInitial") {
        if (props.onExecutedNode) props.onExecutedNode(currentNode);
        if (!nextEdgesIds.length) {
          props.onFinish && (await props.onFinish("110"));
          return res();
        }
        const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
        if (isDepend) return res();

        // @ts-expect-error
        execute({
          ...props,
          type:
            nextEdgesIds[0].nodeNextType === "nodeAttendantAI"
              ? "running"
              : "initial",
          currentNodeId: nextEdgesIds[0].id,
        });
        return;
      }

      if (currentNode.type === "nodeFacebookConversions") {
        await LibraryNodes.NodeFacebookConversions({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: { ...currentNode.data },
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNode.id,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("128"));
              return;
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("140"));
              return;
            }

            if (nextEdgesIds[0].nodeNextType === "nodeReply") {
              if (props.onExecutedNode) {
                props.onExecutedNode({
                  id: nextEdgesIds[0].id,
                  type: nextEdgesIds[0].nodeNextType!,
                });
              }
              return res();
            } else {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
            }

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeMessage") {
        await LibraryNodes.NodeMessage({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: { ...currentNode.data },
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNode.id,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("128"));
              return;
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("140"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            const nextNodeFind = props.nodes.find(
              (f) => f.id === nextEdgesIds[0].id
            );

            if (nextNodeFind?.type === "nodeReply") {
              // aqui vai criar o tempo de timeout do bloco de resposta;
              // o ideal é que essa função de timeout fosse adicionada em todas as respostas dos blocos
              if (nextNodeFind.data.timeOut) {
                const timeOut = nextNodeFind.data.timeOut;
                if (timeOut.type && timeOut.value) {
                  const keyMap = props.numberConnection + props.lead.number;
                  createJobNodeReply({
                    connectionId: props.connectionWhatsId,
                    keyMap,
                    leadNumber: props.lead.number,
                    timeOut,
                    nextEdgesIds,
                    onExecutedNode: async () =>
                      props.onExecutedNode && props.onExecutedNode(currentNode),
                    reExecute: (currentNodeId) => {
                      return execute({ ...props, currentNodeId });
                    },
                    onFinish: async () =>
                      props.onFinish && (await props.onFinish("272")),
                    res: res,
                    onFinishFlow: () => {
                      if (props.isSavePositionLead) {
                        if (props.onExecutedNode) {
                          props.onExecutedNode(currentNode);
                        }
                      }
                      if (props.onFinish) props.onFinish();
                      return res();
                    },
                    onForkFlow: async () => {
                      const nextNodeId = nextEdgesIds?.find(
                        (nd) => nd.sourceHandle === "timeOut"
                      );
                      if (!nextNodeId) {
                        props.onFinish && (await props.onFinish("307"));
                        return res();
                      }
                      if (props.isSavePositionLead) {
                        if (props.onExecutedNode) {
                          props.onExecutedNode(currentNode);
                        }
                      }
                      isSendMessageOfFailedAttempts.set(keyMap, false);
                      countAttemptsReply.set(keyMap, 0);
                      const isDepend = nextNodeId.nodeNextType === "nodeReply";
                      if (isDepend) return res();
                      return execute({
                        ...props,
                        currentNodeId: nextNodeId.id,
                      });
                    },
                    onSubmitFlow: async () => {
                      if (timeOut.action?.run === "SUBMIT_FLOW") {
                        let flowAlreadyExists = flowsMap.get(
                          timeOut.action!.submitFlowId.toString()
                        );
                        if (!flowAlreadyExists) {
                          const newFlow = await ModelFlows.aggregate([
                            {
                              $match: {
                                _id: timeOut.action!.submitFlowId,
                              },
                            },
                            {
                              $project: {
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

                          if (!newFlow?.length) {
                            return "SE CASO O FLUXO QUE ELE ESCOLHEU NÃO EXISTIR?";
                          }

                          const { nodes, edges } = newFlow[0];
                          flowsMap.set(
                            timeOut.action!.submitFlowId.toString(),
                            {
                              nodes,
                              edges,
                            }
                          );
                          flowAlreadyExists = { nodes, edges };
                        }
                        await prisma.flowState.update({
                          where: { id: props.flowStateId },
                          data: { flowId: timeOut.action!.submitFlowId },
                        });
                        isSendMessageOfFailedAttempts.set(keyMap, false);
                        countAttemptsReply.set(keyMap, 0);
                        const currentNode2 = flowAlreadyExists.nodes.find(
                          (f: any) => f.id === "0"
                        );
                        const nextEdgesIds2 = flowAlreadyExists.edges
                          .filter((f: any) => currentNode2?.id === f.source)
                          ?.map((nn: any) => {
                            const node = flowAlreadyExists.nodes.find(
                              (f: any) => f.id === nn.target
                            );
                            return {
                              id: nn.target,
                              sourceHandle: nn.sourceHandle,
                              nodeNextType: node?.type,
                            };
                          });
                        const isDepend =
                          nextEdgesIds2[0].nodeNextType === "nodeReply";
                        if (isDepend) return res();
                        return execute({
                          ...props,
                          nodes: flowAlreadyExists.nodes,
                          edges: flowAlreadyExists.edges,
                          currentNodeId: "0",
                        });
                      }
                    },
                  });
                }
              }
            }
            console.log({ isDepend });
            if (isDepend) {
              if (props.onExecutedNode) {
                props.onExecutedNode({
                  id: nextEdgesIds[0].id,
                  type: nextEdgesIds[0].nodeNextType!,
                });
              }
              return res();
            } else {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
            }

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeAttendantAI") {
        await LibraryNodes.NodeAttendantAI({
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: { ...currentNode.data },
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNode.id,
          message: props.type === "running" ? props.message : undefined,
        })
          .then(async (status) => {
            console.log({ status });
            if (
              status === "goal-achieved" ||
              status === "role-limit-interactions"
            ) {
              const nextNodeId = nextEdgesIds?.find((nd) =>
                nd.sourceHandle?.includes(status)
              );
              if (!nextNodeId) {
                props.onFinish && (await props.onFinish("711"));
                return res();
              }
              if (props.isSavePositionLead) {
                if (props.onExecutedNode) props.onExecutedNode(currentNode);
                //   await updateContactWAOnCampaign(
                //     props.contactsWAOnAccountOnAudienceOnCampaignId,
                //     { indexNode: nextNodeId.id }
                //   );
              }
              const isDepend = nextNodeId.nodeNextType === "nodeReply";
              if (isDepend) return res();
              return execute({ ...props, currentNodeId: nextNodeId.id });
            }

            if (status === "paused") {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              return res();
            }
            if (status === "repeat") {
              return execute({
                ...props,
                type: "initial",
                currentNodeId: currentNode.id,
              });
            }
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("128"));
              return;
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("140"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) {
              if (props.onExecutedNode) {
                props.onExecutedNode({
                  id: nextEdgesIds[0].id,
                  type: nextEdgesIds[0].nodeNextType!,
                });
              }
              return res();
            } else {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
            }

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
      }
      if (currentNode.type === "nodeReply") {
        if (props.type === "running") {
          console.log("ENTROU NO BLOCO DE RESPOSTA");
          console.log(props.message);
          await LibraryNodes.NodeReply({
            numberLead: props.lead.number,
            numberConnection: props.numberConnection,
            data: currentNode.data,
            message: props.message,
            flowStateId: props.flowStateId,
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
          })
            .then(async (d: any) => {
              props.onEnterNode && (await props.onEnterNode(currentNode.id));
              const keyMap = props.numberConnection + props.lead.number;
              if (d.action === "CONTINUE" || d.action === "NEXT") {
                const isNextNodeMain = nextEdgesIds.find(
                  (nh) => !nh.sourceHandle || nh.sourceHandle === "main"
                );
                if (!isNextNodeMain) {
                  props.onFinish && props.onFinish("332");
                  return res();
                }
                isSendMessageOfFailedAttempts.set(keyMap, false);
                countAttemptsReply.set(keyMap, 0);
                const isDepend = isNextNodeMain.nodeNextType === "nodeReply";
                if (isDepend) return res();
                return execute({ ...props, currentNodeId: isNextNodeMain.id });
              }
            })
            .catch((error: any) => {
              props.onErrorNumber && props.onErrorNumber();
              return res();
            });
        }
        return res();
      }
      if (currentNode.type === "nodeMenu") {
        if (props.type === "initial") {
          const { interval, items, header, footer } = currentNode.data;

          let text = `*${header}*\n\n`;
          for (const item of items) {
            text += `[${item.activators[0].value}] - ${item.value}\n`;
          }
          if (footer) {
            text += `\n_${footer}_`;
          }

          const delay = interval ? interval : 2;
          await props.clientWA
            .sendPresenceUpdate("composing", props.lead.number)
            .then(() => {})
            .catch((ERR) => console.log(ERR));
          setTimeout(async () => {
            await props.clientWA.sendMessage(props.lead.number, {
              text,
            });
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("128"));
              return;
            }
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            return res();
          }, delay * 1000);
        }
        const scheduleExecutionMenu = scheduleExecutionsMenu.get(keyMap);

        if (!scheduleExecutionMenu) {
          if (currentNode.data.validateReply?.timeOut) {
            let { type, value, action } =
              currentNode.data.validateReply.timeOut;

            const nextTimeStart = getNextTimeOut(type, value > 0 ? value : 1);

            const timeOnExecuteActionTimeOut = scheduleJob(
              nextTimeStart,
              async () => {
                await baileysWATypingDelay({
                  delay: action.interval,
                  toNumber: props.lead.number,
                  botWA: props.clientWA,
                });
                props.clientWA.sendMessage(props.lead.number, {
                  text: action.value,
                });

                if (action.run === "CONTINUE") {
                  const isNextNodeMain = nextEdgesIds.find(
                    (nh) => !nh.sourceHandle
                  )?.id;

                  if (!isNextNodeMain) {
                    props.onFinish && (await props.onFinish("192"));
                    return res();
                  }
                  return execute({ ...props, currentNodeId: isNextNodeMain });
                }
                if (action.run === "END_FLOW") {
                  props.onFinish && (await props.onFinish("549"));
                  return res();
                }
                if (action.run === "SUBMIT_FLOW") {
                  let flowAlreadyExists = flowsMap.get(
                    action.submitFlowId.toString()
                  );

                  if (!flowAlreadyExists) {
                    const newFlow = await ModelFlows.aggregate([
                      {
                        $match: {
                          _id: action.submitFlowId,
                        },
                      },
                      {
                        $project: {
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

                    if (!newFlow?.length) {
                      return "SE CASO O FLUXO QUE ELE ESCOLHEU NÃO EXISTIR?";
                    }

                    const { nodes, edges } = newFlow[0];
                    flowsMap.set(action.submitFlowId.toString(), {
                      nodes,
                      edges,
                    });
                    flowAlreadyExists = { nodes, edges };
                  }
                  if (props.onExecutedNode) props.onExecutedNode(currentNode);
                  // await prisma.contactsWAOnAccountOnAudienceOnCampaign.update({
                  //   where: {
                  //     id: props.contactsWAOnAccountOnAudienceOnCampaignId,
                  //   },
                  //   data: { flowId: action.submitFlowId },
                  // });
                  isSendMessageOfFailedAttempts.set(keyMap, false);
                  countAttemptsReply.set(keyMap, 0);
                  const currentNode2 = flowAlreadyExists.nodes.find(
                    (f: any) => f.id === "0"
                  );
                  const nextEdgesIds2 = flowAlreadyExists.edges
                    .filter((f: any) => currentNode2?.id === f.source)
                    ?.map((nn: any) => {
                      const node = flowAlreadyExists.nodes.find(
                        (f: any) => f.id === nn.target
                      );
                      return {
                        id: nn.target,
                        sourceHandle: nn.sourceHandle,
                        nodeNextType: node?.type,
                      };
                    });
                  const isDepend =
                    nextEdgesIds2[0].nodeNextType === "nodeReply";
                  if (isDepend) return res();
                  return execute({
                    ...props,
                    nodes: flowAlreadyExists.nodes,
                    edges: flowAlreadyExists.edges,
                    currentNodeId: "0",
                  });
                }
                if (action.run === "FORK") {
                  const nextNodeId = nextEdgesIds?.find(
                    (nd) => nd.sourceHandle === "timeOut"
                  );
                  if (!nextNodeId) {
                    props.onFinish && (await props.onFinish("640"));
                    return res();
                  }
                  if (props.isSavePositionLead) {
                    if (props.onExecutedNode) props.onExecutedNode(currentNode);
                    //   await updateContactWAOnCampaign(
                    //     props.contactsWAOnAccountOnAudienceOnCampaignId,
                    //     { indexNode: nextNodeId.id }
                    //   );
                  }
                  isSendMessageOfFailedAttempts.set(keyMap, false);
                  countAttemptsReply.set(keyMap, 0);
                  const isDepend = nextNodeId.nodeNextType === "nodeReply";
                  if (isDepend) return res();
                  return execute({ ...props, currentNodeId: nextNodeId.id });
                }
              }
            );
            console.log(timeOnExecuteActionTimeOut);
            scheduleExecutionsMenu.set(keyMap, timeOnExecuteActionTimeOut);
          }
        }

        // Caso dê error em produção foi por comentar as 3 linhas abaixo
        // await new Promise((s) => setTimeout(s, 100));
        // const scheduleExecutionMenu2 = scheduleExecutionsMenu.get(keyMap);
        // console.log({ agendamento2: !!scheduleExecutionMenu2 });

        if (props.type === "running") {
          await LibraryNodes.NodeMenu({
            numberLead: props.lead.number,
            numberConnection: props.numberConnection,
            data: currentNode.data,
            message: props.message,
            flowStateId: props.flowStateId,
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            nodeId: currentNodeId,
            connectionWhatsId: props.connectionWhatsId,
          })
            .then(async (d) => {
              console.log({ d });
              props.onEnterNode && (await props.onEnterNode(currentNode.id));
              if (d.action !== "SUBMIT_FLOW" && !nextEdgesIds.length) {
                scheduleExecutionsMenu.get(keyMap)?.cancel();
                scheduleExecutionsMenu.delete(keyMap);
                props.onFinish && props.onFinish("672");
                return res();
              }
              if (d.action === "END_FLOW") {
                scheduleExecutionsMenu.get(keyMap)?.cancel();
                scheduleExecutionsMenu.delete(keyMap);
                await prisma.flowState.update({
                  where: { id: props.flowStateId },
                  data: { isFinish: true },
                });
                isSendMessageOfFailedAttempts.set(keyMap, false);
                countAttemptsReply.set(keyMap, 0);
                return res();
              }
              if (d.action === "FORK") {
                scheduleExecutionsMenu.get(keyMap)?.cancel();
                scheduleExecutionsMenu.delete(keyMap);
                const nextNodeId = nextEdgesIds?.find((nd) =>
                  nd.sourceHandle?.includes(d.type)
                );
                if (!nextNodeId) {
                  props.onFinish && (await props.onFinish("711"));
                  return res();
                }
                if (props.isSavePositionLead) {
                  if (props.onExecutedNode) props.onExecutedNode(currentNode);
                  //   await updateContactWAOnCampaign(
                  //     props.contactsWAOnAccountOnAudienceOnCampaignId,
                  //     { indexNode: nextNodeId.id }
                  //   );
                }
                isSendMessageOfFailedAttempts.set(keyMap, false);
                countAttemptsReply.set(keyMap, 0);
                const isDepend = nextNodeId.nodeNextType === "nodeReply";
                if (isDepend) return res();
                return execute({ ...props, currentNodeId: nextNodeId.id });
              }
              if (d.action === "SUBMIT_FLOW") {
                scheduleExecutionsMenu.get(keyMap)?.cancel();
                scheduleExecutionsMenu.delete(keyMap);
                let flowAlreadyExists = flowsMap.get(d.flowId);

                if (!flowAlreadyExists) {
                  const newFlow = await ModelFlows.aggregate([
                    { $match: { accountId: 1, _id: d.flowId } },
                    {
                      $project: {
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

                  if (!newFlow?.length) {
                    return "SE CASO O FLUXO QUE ELE ESCOLHEU NÃO EXISTIR?";
                  }

                  const { nodes, edges } = newFlow[0];
                  flowsMap.set(d.flowId, { nodes, edges });
                  flowAlreadyExists = { nodes, edges };
                }
                isSendMessageOfFailedAttempts.set(keyMap, false);
                countAttemptsReply.set(keyMap, 0);
                const currentNode2 = flowAlreadyExists.nodes.find(
                  (f: any) => f.id === "0"
                );
                const nextEdgesIds2 = flowAlreadyExists.edges.filter(
                  (f: any) => currentNode2?.id === f.source
                );
                const isDepend = nextEdgesIds2[0].nodeNextType === "nodeReply";
                if (isDepend) return res();
                return execute({
                  ...props,
                  nodes: flowAlreadyExists.nodes,
                  edges: flowAlreadyExists.edges,
                  currentNodeId: "0",
                });
              }
              if (d.action === "SUCESS") {
                scheduleExecutionsMenu.get(keyMap)?.cancel();
                scheduleExecutionsMenu.delete(keyMap);
                const nextNode = nextEdgesIds.find(
                  (ed) => ed.sourceHandle === d.handleId
                );
                if (!nextNode) {
                  props.onFinish && props.onFinish("785");
                  return res();
                }
                if (props.isSavePositionLead) {
                  if (props.onExecutedNode) props.onExecutedNode(currentNode);
                  //   await updateContactWAOnCampaign(
                  //     props.contactsWAOnAccountOnAudienceOnCampaignId,
                  //     { indexNode: nextNode.id }
                  //   );
                }
                const isDepend = nextNode.nodeNextType === "nodeReply";
                if (isDepend) return res();
                if (nextNode.nodeNextType === "nodeMenu") {
                  return execute({
                    ...props,
                    type: "initial",
                    currentNodeId: nextNode.id,
                  });
                }
                return execute({ ...props, currentNodeId: nextNode.id });
              }
              if (
                d.action === "REPLY_FAIL" &&
                currentNode.data.validateReply?.timeOut
              ) {
                scheduleExecutionsMenu.get(keyMap)?.cancel();
                scheduleExecutionsMenu.delete(keyMap);
                let { type, value, action } =
                  currentNode.data.validateReply.timeOut;

                const nextTimeStart = getNextTimeOut(type, value);

                const timeOnExecuteActionTimeOut = scheduleJob(
                  nextTimeStart,
                  async () => {
                    await baileysWATypingDelay({
                      delay: action.interval,
                      toNumber: props.lead.number,
                      botWA: props.clientWA,
                    });
                    props.clientWA.sendMessage(props.lead.number, {
                      text: action.value,
                    });

                    if (action.run === "CONTINUE") {
                      const isNextNodeMain = nextEdgesIds.find(
                        (nh) => !nh.sourceHandle
                      )?.id;

                      if (!isNextNodeMain) {
                        props.onFinish && (await props.onFinish("192"));
                        return res();
                      }
                      return execute({
                        ...props,
                        currentNodeId: isNextNodeMain,
                      });
                    }
                    if (action.run === "END_FLOW") {
                      props.onFinish && (await props.onFinish("549"));
                      return res();
                    }
                    if (action.run === "SUBMIT_FLOW") {
                      let flowAlreadyExists = flowsMap.get(
                        action.submitFlowId.toString()
                      );

                      if (!flowAlreadyExists) {
                        const newFlow = await ModelFlows.aggregate([
                          {
                            $match: {
                              _id: action.submitFlowId,
                            },
                          },
                          {
                            $project: {
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

                        if (!newFlow?.length) {
                          return "SE CASO O FLUXO QUE ELE ESCOLHEU NÃO EXISTIR?";
                        }

                        const { nodes, edges } = newFlow[0];
                        flowsMap.set(action.submitFlowId.toString(), {
                          nodes,
                          edges,
                        });
                        flowAlreadyExists = { nodes, edges };
                      }
                      if (props.onExecutedNode)
                        props.onExecutedNode(currentNode);
                      // await prisma.contactsWAOnAccountOnAudienceOnCampaign.update({
                      //   where: {
                      //     id: props.contactsWAOnAccountOnAudienceOnCampaignId,
                      //   },
                      //   data: { flowId: action.submitFlowId },
                      // });
                      isSendMessageOfFailedAttempts.set(keyMap, false);
                      countAttemptsReply.set(keyMap, 0);
                      const currentNode2 = flowAlreadyExists.nodes.find(
                        (f: any) => f.id === "0"
                      );
                      const nextEdgesIds2 = flowAlreadyExists.edges
                        .filter((f: any) => currentNode2?.id === f.source)
                        ?.map((nn: any) => {
                          const node = flowAlreadyExists.nodes.find(
                            (f: any) => f.id === nn.target
                          );
                          return {
                            id: nn.target,
                            sourceHandle: nn.sourceHandle,
                            nodeNextType: node?.type,
                          };
                        });
                      const isDepend =
                        nextEdgesIds2[0].nodeNextType === "nodeReply";
                      if (isDepend) return res();
                      return execute({
                        ...props,
                        nodes: flowAlreadyExists.nodes,
                        edges: flowAlreadyExists.edges,
                        currentNodeId: "0",
                      });
                    }
                    if (action.run === "FORK") {
                      const nextNodeId = nextEdgesIds?.find(
                        (nd) => nd.sourceHandle === "timeOut"
                      );
                      if (!nextNodeId) {
                        props.onFinish && (await props.onFinish("640"));
                        return res();
                      }
                      if (props.isSavePositionLead) {
                        if (props.onExecutedNode)
                          props.onExecutedNode(currentNode);
                        //   await updateContactWAOnCampaign(
                        //     props.contactsWAOnAccountOnAudienceOnCampaignId,
                        //     { indexNode: nextNodeId.id }
                        //   );
                      }
                      isSendMessageOfFailedAttempts.set(keyMap, false);
                      countAttemptsReply.set(keyMap, 0);
                      const isDepend = nextNodeId.nodeNextType === "nodeReply";
                      if (isDepend) return res();
                      return execute({
                        ...props,
                        currentNodeId: nextNodeId.id,
                      });
                    }
                  }
                );
                scheduleExecutionsMenu.set(keyMap, timeOnExecuteActionTimeOut);
                return res();
              }
            })
            .catch((error) => {
              props.onErrorNumber && props.onErrorNumber();
              return res();
            });
        }
        return res();
      }
      if (currentNode.type === "nodeValidation") {
        await LibraryNodes.NodeValidation({
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          nodeId: currentNodeId,
          accountId: props.accountId,
        })
          .then(async (state) => {
            const nextNodeCaseNone = nextEdgesIds.find((nei) =>
              nei.sourceHandle?.includes(state)
            );
            if (!nextNodeCaseNone) {
              props.onFinish && (await props.onFinish("839"));
              return;
            }
            const isDepend = nextNodeCaseNone?.nodeNextType === "nodeReply";
            if (isDepend) return res();
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeCaseNone?.id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSwitch") {
        await LibraryNodes.NodeSwitch({
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          nodeId: currentNodeId,
        })
          .then(async ({ handleId }) => {
            if (handleId) {
              const nextEdge = nextEdgesIds.find(
                (n) => n.sourceHandle === handleId
              );
              if (!nextEdge) {
                props.onFinish && (await props.onFinish("834"));
                return;
              }
              const isDepend = nextEdge.nodeNextType === "nodeReply";
              if (isDepend) return res();

              return execute({
                ...props,
                type: "initial",
                currentNodeId: nextEdge.id,
              });
            }
            const nextNodeCaseNone = nextEdgesIds.find((nei) =>
              nei.sourceHandle?.includes("case_none")
            );
            if (!nextNodeCaseNone) {
              props.onFinish && (await props.onFinish("839"));
              return;
            }
            const isDepend = nextNodeCaseNone?.nodeNextType === "nodeReply";
            if (isDepend) return res();

            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeCaseNone?.id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendContact") {
        await LibraryNodes.NodeSendContact({
          data: currentNode.data,
          numberLead: props.lead.number,
          nodeId: currentNodeId,
          connectionId: props.connectionWhatsId,
        })
          .then(async () => {
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendVideo") {
        await LibraryNodes.NodeSendVideo({
          data: currentNode.data,
          connectionId: props.connectionWhatsId,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("101"));
              return res();
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendPdf") {
        await LibraryNodes.NodeSendPdf({
          data: currentNode.data,
          connectionId: props.connectionWhatsId,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("101"));
              return res();
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendFile") {
        await LibraryNodes.NodeSendFile({
          data: currentNode.data,
          connectionId: props.connectionWhatsId,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("101"));
              return res();
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendImage") {
        await LibraryNodes.NodeSendImage({
          data: currentNode.data,
          connectionId: props.connectionWhatsId,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("101"));
              return res();
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendAudio") {
        await LibraryNodes.NodeSendAudio({
          data: currentNode.data,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
          connectionWhatsId: props.connectionWhatsId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("101"));
              return res();
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendLink") {
        await LibraryNodes.NodeSendLink({
          data: currentNode.data,
          connectionId: props.connectionWhatsId,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("101"));
              return res();
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeSendLocationGPS") {
        await LibraryNodes.NodeSendLocationGPS({
          data: currentNode.data,
          connectionId: props.connectionWhatsId,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1080"));
              return res();
            }

            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeMathematicalOperators") {
        await LibraryNodes.NodeMathematicalOperators({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1108"));
              return res();
            }

            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeDistributeFlow") {
        await LibraryNodes.NodeDistributeFlow({
          data: currentNode.data,
          connectionNumber: props.numberConnection,
          accountId: props.accountId,
          nodeId: currentNodeId,
        })
          .then(async (key) => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!key || !nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1108"));
              return res();
            }

            const nextEdge = nextEdgesIds.find((n) => n.sourceHandle === key);

            if (!nextEdge) {
              props.onFinish && (await props.onFinish("1163"));
              return res();
            }

            const isDepend = nextEdge.nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdge.id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeLogicalCondition") {
        await LibraryNodes.NodeLogicalCondition({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          nodeId: currentNodeId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
        })
          .then(async (exit) => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!exit || !nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1163"));
              return res();
            }

            const nextEdge = nextEdgesIds.find((n) =>
              n.sourceHandle?.includes(exit)
            );

            if (!nextEdge) {
              props.onFinish && (await props.onFinish("1163"));
              return res();
            }

            const isDepend = nextEdge.nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdge.id,
            });
          })
          .catch((error) => {
            console.log("Error node condicao", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeCheckPoint") {
        await LibraryNodes.NodeCheckPoint({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1163"));
              return res();
            }

            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error node video", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeAction") {
        await LibraryNodes.NodeAction({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async (d) => {
            if (props.onExecutedNode) props.onExecutedNode(currentNode);
            props.onEnterNode && (await props.onEnterNode(currentNode.id));
            if (d.action === "CONTINUE") {
              if (!nextEdgesIds.length) {
                props.onFinish && props.onFinish("1280");
                return res();
              }
              const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
              if (isDepend) return res();

              return execute({ ...props, currentNodeId: nextEdgesIds[0].id });
            }

            if (d.action !== "SUBMIT_FLOW" && !nextEdgesIds.length) {
              props.onFinish && props.onFinish("1290");
              return res();
            }
            if (d.action === "END_FLOW") {
              props.onFinish && props.onFinish("1461");
              return res();
            }
            if (d.action === "SUBMIT_FLOW") {
              return execute({
                ...props,
                currentNodeId: "0",
                nodes: d.nodes,
                edges: d.edges,
              });
            }
          })
          .catch((error) => {
            console.log("error ao executar nodeAction", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "nodeNotifyNumber") {
        await LibraryNodes.NodeNotifyNumber({
          connectionWhatsId: props.connectionWhatsId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeSendHumanService") {
        await LibraryNodes.NodeSendHumanService({
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            props.onFinish && (await props.onFinish("1256"));
            return;
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeEmailSending") {
        await LibraryNodes.NodeEmailSending({
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeLinkTranckingPixel") {
        await LibraryNodes.NodeLinkTackingPixel({
          campaignId: props.campaignId,
          flowId: props.flowId,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          numberLead: props.lead.number,
          data: currentNode.data,
          connectionWhatsId: props.connectionWhatsId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("Error", error);
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeTime") {
        console.log("Entrou no bloco de tempo");
        await LibraryNodes.NodeTime({
          ...(props.type === "initial"
            ? {
                type: "flow",
                data: currentNode.data,
                nodeId: currentNodeId,
              }
            : {
                type: "reply",
                data: currentNode.data,
                message: props.message,
                midia: props.isMidia,
                nodeId: currentNodeId,
              }),
        })
          .then(async (state) => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend || !state) {
              if (!state && props.onExecutedNode) {
                props.onExecutedNode(currentNode);
              }
              return res();
            }

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeInsertLeaderInAudience") {
        await LibraryNodes.NodeInsertLeaderInAudience({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeWebhook") {
        await LibraryNodes.NodeWebhook({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeWebform") {
        await LibraryNodes.NodeWebform({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeNewCardTrello") {
        await LibraryNodes.NodeNewCardTrello({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.onFinish && (await props.onFinish("1256"));
              return;
            }
            if (props.isSavePositionLead) {
              if (props.onExecutedNode) props.onExecutedNode(currentNode);
              // await updateContactWAOnCampaign(
              //   props.contactsWAOnAccountOnAudienceOnCampaignId,
              //   { indexNode: nextEdgesIds[0].id }
              // );
            }
            if (nextEdgesIds.length > 1) {
              props.onFinish && (await props.onFinish("1268"));
              return;
            }
            const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
            if (isDepend) return res();

            execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            props.onErrorNumber && props.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "nodeInterruptionLinkTrackingPixel") {
        if (nextEdgesIds.length > 1) {
          props.onFinish && (await props.onFinish("1268"));
          return;
        }

        const isDepend = nextEdgesIds[0].nodeNextType === "nodeReply";
        if (isDepend) return res();

        execute({
          ...props,
          type: "initial",
          currentNodeId: nextEdgesIds[0].id,
        });
      }
      res();
    };

    execute({ ...propsC, currentNodeId });
  });
};
