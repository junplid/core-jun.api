import { WASocket } from "baileys";
import { prisma } from "../../adapters/Prisma/client";
import { LibraryNodes } from "./nodes";
import { NodePayload, TypeNodesPayload } from "./Payload";
import { cacheFlowInExecution } from "../../adapters/Baileys/Cache";
import { cacheExecuteTimeoutAgentAI, cacheTestAgentTemplate } from "./cache";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { resolveHourAndMinute } from "../../utils/resolveHour:mm";
import { handleFileTemp } from "../../utils/handleFileTemp";
import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";
import { ICacheTestAgentTemplate } from "../../core/testAgentTemplate/UseCase";

interface Edges {
  source: string;
  target: string;
  sourceHandle: string | null;
  id: string;
}

export type IPropsControler = (
  | {
      actions?: {
        onEnterNode?(props: {
          id: string;
          flowId: string;
          agentId?: number;
        }): Promise<void>;
        onExecutedNode?(
          props: { id: string; flowId: string },
          isShots?: boolean,
        ): Promise<void>;
        onFinish?(vl?: string): Promise<void>;
        onErrorNumber?(): void;
        onErrorClient?(indexNode: string): void;
      };
      oldNodeId: string;
      nodes: NodePayload[];
      ticketProtocol?: string;
      edges: Edges[];
      flowId: string;
      flowStateId: number;
      currentNodeId?: string;
      campaignId?: number;
      chatbotId?: number;

      lead_id: string;
      contactAccountId: number;
      connectionId: number;

      external_adapter:
        | { clientWA: WASocket; type: "baileys" }
        | { type: "instagram"; page_token: string };

      isSavePositionLead?: boolean;
      accountId: number;
      previous_response_id?: string;
      businessName: string;
      flowBusinessIds?: number[];
      businessId: number;
      forceFinish?: boolean;
      action: string | null;
      mode: "prod";
    }
  | {
      mode: "testing";
      action: string | null;
      actions?: {
        onEnterNode?(props: {
          id: string;
          flowId: string;
          agentId?: number;
        }): Promise<void>;
        onExecutedNode?(
          props: { id: string; flowId: string },
          isShots?: boolean,
        ): Promise<void>;
        onFinish?(vl?: string): Promise<void>;
        onErrorNumber?(): void;
        onErrorClient?(indexNode: string): void;
      };
      oldNodeId: string;
      nodes: NodePayload[];
      edges: Edges[];
      currentNodeId?: string;
      accountId: number;
      previous_response_id?: string;
      businessId: number;
      token_modal_chat_template: string;
      forceFinish?: boolean;
      flowId: string;
      contactAccountId: number;
      lead_id: string;
    }
) &
  (
    | { type: "initial" }
    | {
        type: "running";
        message: string;
        audioPath?: string;
        reactionText?: string;
        isMidia?: boolean;
        contactsWAOnAccountReactionId?: number;
        beforeName?: string;
        afterName?: string;
        cardId?: string;
      }
  );

// responsável por executar o controle do fluxo de conversa e manipular caches
export const NodeControler = ({
  currentNodeId = "0",
  oldNodeId = "0",
  ...propsC
}: IPropsControler): Promise<void> => {
  let keyMap: string = "";
  if (propsC.mode === "prod") {
    keyMap = `${propsC.connectionId}-${propsC.lead_id}`;
  } else {
    keyMap = `${propsC.token_modal_chat_template}-${propsC.lead_id}`;
  }

  return new Promise((res, rej) => {
    if (cacheFlowInExecution.has(keyMap)) {
      console.log("Já existe uma execução em andamento para este lead");
      // @ts-expect-error
      if (!propsC.contactsWAOnAccountReactionId) {
        return res();
      }
    }
    cacheFlowInExecution.set(keyMap, true);
    const execute = async (props: IPropsControler): Promise<void> => {
      if (props.mode === "prod" && props.chatbotId) {
        try {
          await new Promise<void>(async (resP, rejP) => {
            async function verify() {
              const chatbot = await prisma.chatbot.findFirst({
                // @ts-expect-error
                where: { id: props.chatbotId },
                select: {
                  interrupted: true,
                  Business: { select: { interrupted: true } },
                  ConnectionWA: { select: { interrupted: true } },
                },
              });

              if (!chatbot) {
                cacheFlowInExecution.delete(keyMap);
                return rejP();
              }
              if (chatbot.interrupted) {
                setTimeout(() => verify, 1000 * 60 * 3);
                return;
              }
              if (chatbot.Business.interrupted) {
                setTimeout(() => verify, 1000 * 60 * 3);
                return;
              }
              if (!chatbot.ConnectionWA) {
                cacheFlowInExecution.delete(keyMap);
                return rejP();
              }
              if (chatbot.ConnectionWA.interrupted) {
                setTimeout(() => verify, 1000 * 60 * 3);
                return;
              }
              cacheFlowInExecution.delete(keyMap);
              return resP();
            }
            verify();
          });
        } catch (error) {
          console.log("Error, chatbot não encontrado!");
          cacheFlowInExecution.delete(keyMap);
          return;
        }
      }

      if (props.mode === "prod" && props.campaignId) {
        try {
          await new Promise<void>(async (resP, rejP) => {
            async function verify() {
              const campaign = await prisma.campaign.findFirst({
                //@ts-expect-error
                where: { id: props.campaignId },
                select: { status: true },
              });

              if (!campaign) return rejP();

              if (
                campaign.status === "paused" ||
                campaign.status === "stopped"
              ) {
                setTimeout(() => verify(), 1000 * 60 * 3);
                return;
              }
              return resP();
            }
            verify();
          });
        } catch (error) {
          console.log("Error, campanha não encontrada!");
          return;
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
        cacheFlowInExecution.delete(keyMap);
        if (props.forceFinish) await props.actions?.onFinish?.("110");
        await props.actions?.onExecutedNode?.({
          id: "0",
          flowId: props.flowId,
        });
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
      //     contactsWAOnAccountId: props.contactAccountId,
      //   })
      //     .then(async ({ handleId }) => {
      //       if (handleId) {
      //         if (props.onExecutedNode) props.onExecutedNode({id: currentNode.id, flowId: props.flowId});
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

      //         const key = `${props.contactAccountId}-${props.connectionWhatsId}`;
      //         currentNodeFlow.set(key, targetNode.id);

      //         const isDepend = targetNode.type === "NodeReply";
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

      console.log(currentNode.type);

      if (currentNode.type === "NodeInitial") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Teste iniciado.`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onExecutedNode) {
          await props.actions?.onExecutedNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        if (!nextEdgesIds.length) {
          cacheFlowInExecution.delete(keyMap);
          if (props.forceFinish) await props.actions?.onFinish?.("110");
          await props.actions?.onExecutedNode?.({
            id: "0",
            flowId: props.flowId,
          });
          return res();
        }

        execute({
          ...props,
          ...(props.type === "running" && { message: props.message }),
          currentNodeId: nextEdgesIds[0].id,
          oldNodeId: currentNode.id,
        });
        return;
      }

      if (
        props.type === "running" &&
        currentNode.type !== "NodeAgentAI" &&
        props.audioPath
      ) {
        await handleFileTemp.cleanFile(props.audioPath);
      }

      if (currentNode.type === "NodeFinish") {
        if (props.actions?.onExecutedNode) {
          await props.actions?.onExecutedNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }

        if (props.mode === "prod" && props.forceFinish) {
          await prisma.flowState.update({
            where: { id: props.flowStateId },
            data: { isFinish: true, finishedAt: new Date() },
          });
          webSocketEmitToRoom()
            .account(props.accountId)
            .dashboard.dashboard_services({
              delta: -1,
              hour: resolveHourAndMinute(),
            });
        }
        props.actions?.onFinish?.();
        return;
      }
      if (currentNode.type === "NodeMessage") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Enviando mensagem`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeMessage({
          ...(props.mode === "prod"
            ? {
                mode: "prod",
                external_adapter: props.external_adapter,
                connectionId: props.connectionId,
                contactAccountId: props.contactAccountId,
                lead_id: props.lead_id,
                sendBy: "bot",
                data: currentNode.data,
                accountId: props.accountId,
                ticketProtocol: props.ticketProtocol,
                nodeId: currentNode.id,
                flowStateId: props.flowStateId,
                action: {
                  onErrorClient: () => {
                    if (props.oldNodeId === "0") {
                      props.actions?.onErrorClient &&
                        props.actions?.onErrorClient(currentNode.id);
                    }
                  },
                },
              }
            : {
                mode: "testing",
                sendBy: "bot",
                accountId: props.accountId,
                nodeId: currentNode.id,
                data: currentNode.data,
                token_modal_chat_template: props.token_modal_chat_template,
                contactAccountId: props.contactAccountId,
                lead_id: props.lead_id,
              }),
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              type: "initial",
              // ...(props.type === "running" && { message: props.message }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeReply") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Esperando resposta`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeReply({
          ...(props.mode === "prod"
            ? {
                mode: "prod",
                lead_id: props.lead_id,
                connectionId: props.connectionId,
                contactAccountId: props.contactAccountId,
                data: currentNode.data,
                message: props.type === "initial" ? undefined : props.message,
                flowBusinessIds: props.flowBusinessIds,
                flowStateId: props.flowStateId,
                accountId: props.accountId,
                async onExecuteSchedule() {
                  const nextNodeId = nextEdgesIds?.find((nd) =>
                    nd.sourceHandle?.includes("timeout"),
                  );
                  if (!nextNodeId) {
                    cacheFlowInExecution.delete(keyMap);
                    if (props.forceFinish)
                      await props.actions?.onFinish?.("110");
                    await props.actions?.onExecutedNode?.({
                      id: "0",
                      flowId: props.flowId,
                    });
                    return res();
                  }
                  if (props.actions?.onExecutedNode) {
                    await props.actions.onExecutedNode({
                      id: currentNode.id,
                      flowId: props.flowId,
                    });
                  }
                  return execute({
                    ...props,
                    type: "initial",
                    currentNodeId: nextNodeId.id,
                    oldNodeId: currentNode.id,
                  });
                },
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                contactAccountId: props.contactAccountId,
                lead_id: props.lead_id,
                token_modal_chat_template: props.token_modal_chat_template,
                data: currentNode.data,
                message: props.type === "initial" ? undefined : props.message,
                async onExecuteSchedule() {
                  const nextNodeId = nextEdgesIds?.find((nd) =>
                    nd.sourceHandle?.includes("timeout"),
                  );
                  if (!nextNodeId) {
                    cacheFlowInExecution.delete(keyMap);
                    if (props.forceFinish)
                      await props.actions?.onFinish?.("110");
                    await props.actions?.onExecutedNode?.({
                      id: "0",
                      flowId: props.flowId,
                    });
                    return res();
                  }
                  if (props.actions?.onExecutedNode) {
                    await props.actions.onExecutedNode({
                      id: currentNode.id,
                      flowId: props.flowId,
                    });
                  }
                  return execute({
                    ...props,
                    type: "initial",
                    currentNodeId: nextNodeId.id,
                    oldNodeId: currentNode.id,
                  });
                },
              }),
        })
          .then(async (d) => {
            console.log({ d });
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (d.action === "NEXT") {
              const isNextNodeMain = nextEdgesIds.find(
                (nh) => !nh.sourceHandle || nh.sourceHandle === "main",
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              if (isNextNodeMain.nodeNextType === "NodeAgentAI") {
                return execute({
                  ...props,
                  type: "running",
                  message: props.type === "initial" ? "" : props.message,
                  currentNodeId: isNextNodeMain.id,
                  oldNodeId: currentNode.id,
                });
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
              });
            }
            if (d.action === "RETURN") {
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
          })
          .catch((error: any) => {
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
      }
      if (currentNode.type === "NodeMenu") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Enviando menu de opções`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeMenu({
          ...(props.mode === "prod"
            ? {
                lead_id: props.lead_id,
                connectionId: props.connectionId,
                contactAccountId: props.contactAccountId,
                accountId: props.accountId,
                external_adapter: props.external_adapter,
                data: currentNode.data,
                nodeId: currentNode.id,
                message: props.type === "initial" ? undefined : props.message,
                flowStateId: props.flowStateId,
                action: {
                  onErrorClient: () => {
                    if (props.oldNodeId === "0") {
                      props.actions?.onErrorClient &&
                        props.actions?.onErrorClient(currentNode.id);
                    }
                  },
                },
                async onExecuteSchedule() {
                  const nextNodeId = nextEdgesIds?.find((nd) =>
                    nd.sourceHandle?.includes("timeout"),
                  );
                  if (!nextNodeId) {
                    if (props.forceFinish)
                      await props.actions?.onFinish?.("110");
                    await props.actions?.onExecutedNode?.({
                      id: "0",
                      flowId: props.flowId,
                    });
                    cacheFlowInExecution.delete(keyMap);
                    return res();
                  }
                  if (props.actions?.onExecutedNode) {
                    await props.actions.onExecutedNode({
                      id: currentNode.id,
                      flowId: props.flowId,
                    });
                  }
                  return execute({
                    ...props,
                    type: "initial",
                    currentNodeId: nextNodeId.id,
                    oldNodeId: currentNode.id,
                  });
                },
                mode: "prod",
              }
            : {
                mode: "testing",
                data: currentNode.data,
                nodeId: currentNode.id,
                message: props.type === "initial" ? undefined : props.message,
                contactAccountId: props.contactAccountId,
                accountId: props.accountId,
                lead_id: props.lead_id,
                token_modal_chat_template: props.token_modal_chat_template,
                async onExecuteSchedule() {
                  const nextNodeId = nextEdgesIds?.find((nd) =>
                    nd.sourceHandle?.includes("timeout"),
                  );
                  if (!nextNodeId) {
                    if (props.forceFinish)
                      await props.actions?.onFinish?.("110");
                    await props.actions?.onExecutedNode?.({
                      id: "0",
                      flowId: props.flowId,
                    });
                    cacheFlowInExecution.delete(keyMap);
                    return res();
                  }
                  if (props.actions?.onExecutedNode) {
                    await props.actions.onExecutedNode({
                      id: currentNode.id,
                      flowId: props.flowId,
                    });
                  }
                  return execute({
                    ...props,
                    type: "initial",
                    currentNodeId: nextNodeId.id,
                    oldNodeId: currentNode.id,
                  });
                },
              }),
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (d.action === "sucess") {
              const isNextNodeMain = nextEdgesIds.find(
                (nh) => nh.sourceHandle === d.sourceHandle,
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
              });
            }
            if (d.action === "return") {
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
            if (d.action === "failAttempt") {
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
            if (d.action === "failed") {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed"),
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
              });
            }
          })
          .catch((error: any) => {
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
      }
      if (currentNode.type === "NodeAddTags") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Adicionando tags`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeAddTags({
          data: currentNode.data,
          contactAccountId: props.contactAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeRemoveTags") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Removendo tags`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeRemoveTags({
          data: currentNode.data,
          contactAccountId: props.contactAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            console.log("nextEdgesIds", nextEdgesIds.length);
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              console.log(!!props.actions?.onExecutedNode);
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }
            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeAddVariables") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Adicionando variáveis`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeAddVariables({
          data: currentNode.data,
          contactAccountId: props.contactAccountId,
          nodeId: currentNodeId,
          accountId: props.accountId,
          numberLead: props.lead_id,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              currentNodeId: nextEdgesIds[0].id,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeRemoveVariables") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Removendo variáveis`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeRemoveVariables({
          data: currentNode.data,
          contactAccountId: props.contactAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendFlow") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendFlow({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          nodeId: currentNodeId,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: "0",
              oldNodeId: "0",
              nodes: d.nodes,
              edges: d.edges,
              flowId: d.flowId,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeIF") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Verificando tags ou variáveis`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeIf({
          data: currentNode.data,
          accountId: props.accountId,
          contactAccountId: props.contactAccountId,
          nodeId: currentNodeId,
          numberLead: props.lead_id,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            const nextNodeId = nextEdgesIds.find((nd) =>
              nd.sourceHandle?.includes(JSON.stringify(d)),
            );
            if (!nextNodeId) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }
            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextNodeId.id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeTimer") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Aguardando um tempo`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeTimer({
          data: currentNode.data,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeNotifyWA") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Enviando mensagem a outro WhatsApp`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeNotifyWA({
          ...(props.mode === "prod"
            ? {
                mode: "prod",
                action: {
                  onErrorClient: () => {
                    if (props.oldNodeId === "0") {
                      props.actions?.onErrorClient &&
                        props.actions?.onErrorClient(currentNode.id);
                    }
                  },
                },
                connectionId: props.connectionId,
                contactAccountId: props.contactAccountId,
                external_adapter: props.external_adapter,
                lead_id: props.lead_id,
                data: currentNode.data,
                accountId: props.accountId,
                businessName: props.businessName,
                ticketProtocol: props.ticketProtocol,
                nodeId: currentNode.id,
                flowStateId: props.flowStateId,
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                contactAccountId: props.contactAccountId,
                data: currentNode.data,
                lead_id: props.lead_id,
                nodeId: currentNode.id,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendFiles") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendFiles({
          lead_id: props.lead_id,
          connectionId: props.connectionId,
          contactAccountId: props.contactAccountId,
          external_adapter: props.external_adapter,
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
          },
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendVideos") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendVideos({
          lead_id: props.lead_id,
          connectionId: props.connectionId,
          contactAccountId: props.contactAccountId,
          external_adapter: props.external_adapter,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
          },
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendImages") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendImages({
          lead_id: props.lead_id,
          connectionId: props.connectionId,
          contactAccountId: props.contactAccountId,
          external_adapter: props.external_adapter,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
          },
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendAudiosLive") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendAudiosLive({
          lead_id: props.lead_id,
          connectionId: props.connectionId,
          external_adapter: props.external_adapter,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
          },
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          flowStateId: props.flowStateId,
          nodeId: currentNode.id,
          contactAccountId: props.contactAccountId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendAudios") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendAudios({
          lead_id: props.lead_id,
          connectionId: props.connectionId,
          external_adapter: props.external_adapter,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
          },
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
          contactAccountId: props.contactAccountId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeAgentAI") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Acessando assistente de IA`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
            agentId: currentNode.data.agentId,
          });
        }
        await LibraryNodes.NodeAgentAI({
          ...(props.mode === "prod"
            ? {
                mode: "prod",
                lead_id: props.lead_id,
                connectionId: props.connectionId,
                contactAccountId: props.contactAccountId,
                external_adapter: props.external_adapter,
                data: currentNode.data,
                nodeId: currentNode.id,
                flowId: props.flowId,
                businessName: props.businessName,
                businessId: props.businessId,
                ...(props.type === "initial"
                  ? { message: undefined }
                  : {
                      message: props.action
                        ? {
                            isDev: true,
                            value: /\[order-\d+\]/.test(props.action)
                              ? `${props.action.replace(
                                  /(.*)\s\[order-(\d)+\]/,
                                  "ROOT solicitou que $1 do pedido $2(ID)",
                                )}`
                              : /\[appointment-\d+\]/.test(props.action)
                                ? `${props.action.replace(
                                    /(.*)\s\[appointment-(\d)+\]/,
                                    "ROOT solicitou que $1 do evento $2(ID)",
                                  )}`
                                : /\[ticket-\d+\]/.test(props.action)
                                  ? `${props.action.replace(
                                      /(.*)\s\[appointment-(\d)+\]/,
                                      "$1",
                                    )}`
                                  : props.action,
                          }
                        : { value: props.message, isDev: false },
                      audioPath: props.audioPath,
                    }),
                actions: {
                  onErrorClient: async () => {
                    props.actions?.onErrorClient &&
                      props.actions?.onErrorClient(currentNode.id);
                  },
                  onExecuteTimeout: async (pre_res_id) => {
                    const nextNodeId = nextEdgesIds?.find((nd) =>
                      nd.sourceHandle?.includes("timeout"),
                    );
                    if (!nextNodeId) {
                      if (!cacheExecuteTimeoutAgentAI.get(keyMap)) {
                        cacheFlowInExecution.delete(keyMap);
                        cacheExecuteTimeoutAgentAI.set(`${keyMap}`, true);
                        return execute({
                          ...props,
                          previous_response_id: pre_res_id || undefined,
                          type: "running",
                          action:
                            "Notificação do sistema: O usuário está ausente ou parou de responder",
                          message:
                            "Notificação do sistema: O usuário está ausente ou parou de responder",
                          currentNodeId: currentNode.id,
                          oldNodeId: currentNode.id,
                        });
                      } else {
                        cacheExecuteTimeoutAgentAI.delete(keyMap);
                        if (props.forceFinish)
                          await props.actions?.onFinish?.("110");
                        await props.actions?.onExecutedNode?.({
                          id: "0",
                          flowId: props.flowId,
                        });
                        cacheFlowInExecution.delete(keyMap);
                        await prisma.flowState.update({
                          where: { id: props.flowStateId },
                          data: { agentId: null },
                        });
                        return res();
                      }
                    }
                    if (props.actions?.onExecutedNode) {
                      await props.actions.onExecutedNode({
                        id: currentNode.id,
                        flowId: props.flowId,
                      });
                    }
                    return execute({
                      ...props,
                      type: "initial",
                      currentNodeId: nextNodeId.id,
                      oldNodeId: currentNode.id,
                    });
                  },
                  onExitNode: async (NAME_HANDLE, previous_response_id) => {
                    // await prisma.flowState.update({
                    //   where: { id: props.flowStateId },
                    //   data: { previous_response_id: null },
                    // });
                    const nextNodeId = nextEdgesIds?.find((nd) =>
                      nd.sourceHandle?.includes(NAME_HANDLE),
                    );
                    if (!nextNodeId) {
                      cacheFlowInExecution.delete(keyMap);
                      if (props.forceFinish)
                        await props.actions?.onFinish?.("110");
                      await props.actions?.onExecutedNode?.({
                        id: "0",
                        flowId: props.flowId,
                      });
                      return res();
                    }
                    if (props.actions?.onExecutedNode) {
                      await props.actions.onExecutedNode({
                        id: currentNode.id,
                        flowId: props.flowId,
                      });
                    }
                    return execute({
                      ...props,
                      previous_response_id: previous_response_id || undefined,
                      type: "initial",
                      currentNodeId: nextNodeId.id,
                      oldNodeId: currentNode.id,
                    });
                  },
                  onSendFlow: async (newFlowId, previous_response_id) => {
                    await LibraryNodes.NodeSendFlow({
                      data: { id: newFlowId },
                      flowStateId: props.flowStateId,
                      nodeId: currentNodeId,
                    })
                      .then(async (d) => {
                        if (props.actions?.onExecutedNode) {
                          await props.actions?.onExecutedNode({
                            id: currentNode.id,
                            flowId: props.flowId,
                          });
                        }
                        return execute({
                          ...props,
                          type: "initial",
                          currentNodeId: "0",
                          oldNodeId: "0",
                          nodes: d.nodes,
                          edges: d.edges,
                          flowBusinessIds: d.businessIds,
                          flowId: d.flowId,
                          previous_response_id:
                            previous_response_id || undefined,
                        });
                      })
                      .catch((error) => {
                        console.log("error ao executar nodeAddTags", error);
                        cacheFlowInExecution.delete(keyMap);
                        props.actions?.onErrorNumber &&
                          props.actions?.onErrorNumber();
                        return res();
                      });
                  },
                  onFinishService: async (previous_response_id) => {
                    await prisma.flowState.update({
                      where: { id: props.flowStateId },
                      data: {
                        isFinish: true,
                        finishedAt: new Date(),
                        ...(previous_response_id && { previous_response_id }),
                      },
                    });
                    webSocketEmitToRoom()
                      .account(props.accountId)
                      .dashboard.dashboard_services({
                        delta: -1,
                        hour: resolveHourAndMinute(),
                      });
                    return res();
                  },
                },
                accountId: props.accountId,
                previous_response_id: props.previous_response_id,
                flowStateId: props.flowStateId,
              }
            : {
                mode: "testing",
                lead_id: props.lead_id,
                data: currentNode.data,
                nodeId: currentNode.id,
                flowId: props.flowId,
                businessId: props.businessId,
                previous_response_id: props.previous_response_id,
                accountId: props.accountId,
                ...(props.type === "initial"
                  ? { message: undefined }
                  : {
                      message: props.action
                        ? {
                            isDev: true,
                            value: /\[order-\d+\]/.test(props.action)
                              ? `${props.action.replace(
                                  /(.*)\s\[order-(\d)+\]/,
                                  "ROOT solicitou que $1 do pedido $2(ID)",
                                )}`
                              : /\[appointment-\d+\]/.test(props.action)
                                ? `${props.action.replace(
                                    /(.*)\s\[appointment-(\d)+\]/,
                                    "ROOT solicitou que $1 do evento $2(ID)",
                                  )}`
                                : /\[ticket-\d+\]/.test(props.action)
                                  ? `${props.action.replace(
                                      /(.*)\s\[appointment-(\d)+\]/,
                                      "$1",
                                    )}`
                                  : props.action,
                          }
                        : { value: props.message, isDev: false },
                      audioPath: props.audioPath,
                    }),
                actions: {
                  onErrorClient: async () => {
                    props.actions?.onErrorClient &&
                      props.actions?.onErrorClient(currentNode.id);
                  },
                  onExecuteTimeout: async (pre_res_id) => {
                    const nextNodeId = nextEdgesIds?.find((nd) =>
                      nd.sourceHandle?.includes("timeout"),
                    );
                    if (!nextNodeId) {
                      if (!cacheExecuteTimeoutAgentAI.get(keyMap)) {
                        cacheFlowInExecution.delete(keyMap);
                        cacheExecuteTimeoutAgentAI.set(`${keyMap}`, true);
                        return execute({
                          ...props,
                          previous_response_id: pre_res_id || undefined,
                          type: "running",
                          action:
                            "Notificação do sistema: O usuário está ausente ou parou de responder",
                          message:
                            "Notificação do sistema: O usuário está ausente ou parou de responder",
                          currentNodeId: currentNode.id,
                          oldNodeId: currentNode.id,
                        });
                      } else {
                        cacheExecuteTimeoutAgentAI.delete(keyMap);
                        if (props.forceFinish)
                          await props.actions?.onFinish?.("110");
                        await props.actions?.onExecutedNode?.({
                          id: "0",
                          flowId: props.flowId,
                        });
                        cacheFlowInExecution.delete(keyMap);
                        return res();
                      }
                    }
                    if (props.actions?.onExecutedNode) {
                      await props.actions.onExecutedNode({
                        id: currentNode.id,
                        flowId: props.flowId,
                      });
                    }
                    return execute({
                      ...props,
                      type: "initial",
                      currentNodeId: nextNodeId.id,
                      oldNodeId: currentNode.id,
                    });
                  },
                  onExitNode: async (NAME_HANDLE, previous_response_id) => {
                    // await prisma.flowState.update({
                    //   where: { id: props.flowStateId },
                    //   data: { previous_response_id: null },
                    // });
                    const nextNodeId = nextEdgesIds?.find((nd) =>
                      nd.sourceHandle?.includes(NAME_HANDLE),
                    );
                    if (!nextNodeId) {
                      cacheFlowInExecution.delete(keyMap);
                      if (props.forceFinish)
                        await props.actions?.onFinish?.("110");
                      await props.actions?.onExecutedNode?.({
                        id: "0",
                        flowId: props.flowId,
                      });
                      return res();
                    }
                    if (props.actions?.onExecutedNode) {
                      await props.actions.onExecutedNode({
                        id: currentNode.id,
                        flowId: props.flowId,
                      });
                    }
                    return execute({
                      ...props,
                      previous_response_id: previous_response_id || undefined,
                      type: "initial",
                      currentNodeId: nextNodeId.id,
                      oldNodeId: currentNode.id,
                    });
                  },
                  onFinishService: async () => {
                    const testInProgress =
                      cacheTestAgentTemplate.get<ICacheTestAgentTemplate>(
                        props.token_modal_chat_template,
                      );
                    if (testInProgress) {
                      cacheTestAgentTemplate.set(
                        props.token_modal_chat_template,
                        {
                          ...testInProgress,
                          nodeId: "0",
                          previous_response_id: null,
                        },
                      );
                    }
                    await SendMessageText({
                      token_modal_chat_template:
                        props.token_modal_chat_template,
                      role: "system",
                      accountId: props.accountId,
                      text: "Encerrou o atendimento.",
                      mode: "testing",
                    });
                    return res();
                  },
                },
                contactAccountId: props.contactAccountId,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (d.action === "sucess") {
              const isNextNodeMain = nextEdgesIds.find(
                (nh) => nh.sourceHandle === d.sourceHandle,
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
              });
            }
            if (d.action === "return") {
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
            if (d.action === "failAttempt") {
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
            if (d.action === "failed") {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed"),
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
              });
            }
          })
          .catch((error: any) => {
            console.log(error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
      }
      if (currentNode.type === "NodeTransferDepartment") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Transferindo para um departamento`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeTransferDepartment({
          ...(props.mode === "prod"
            ? {
                mode: "prod",
                connectionId: props.connectionId,
                contactAccountId: props.contactAccountId,
                data: currentNode.data,
                flowStateId: props.flowStateId,
                nodeId: currentNodeId,
                accountId: props.accountId,
                external_adapter: props.external_adapter,
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async (d) => {
            if (d === "OK") {
              if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return;
              }
              await props.actions?.onExecutedNode?.({
                id: nextEdgesIds[0].id,
                flowId: props.flowId,
              });
              return res();
            }
            if (d === "ERROR") {
              if (props.actions?.onExecutedNode) {
                await props.actions?.onExecutedNode({
                  id: currentNode.id,
                  flowId: props.flowId,
                });
              }
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed"),
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
                oldNodeId: isNextNodeMain.id,
              });
            }
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (props.mode === "prod" && currentNode.type === "NodeFbPixel") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeFbPixel({
          lead_id: props.lead_id,
          contactAccountId: props.contactAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeListenReaction") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        if (props.type !== "running") return res();
        await LibraryNodes.NodeListenReaction({
          contactAccountId: props.contactAccountId,
          data: currentNode.data,
          message: props.message,
          reactionText: props.reactionText || "",
          contactsWAOnAccountReactionId: props.contactsWAOnAccountReactionId,
        })
          .then(async () => {
            // a saida vai ser 2 então.
            // uma saida para o contato que reagiu - parallel

            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            const nextNodeIdMain = nextEdgesIds.find(
              (nd) => nd.sourceHandle === "main",
            );
            if (nextNodeIdMain?.id) {
              execute({
                ...props,
                type: "initial",
                currentNodeId: nextNodeIdMain.id,
                oldNodeId: currentNode.id,
              });
            }
            const nextNodeIdParallel = nextEdgesIds.find(
              (nd) => nd.sourceHandle === "parallel",
            );

            if (nextNodeIdParallel?.id && props.contactsWAOnAccountReactionId) {
              execute({
                ...props,
                contactAccountId: props.contactsWAOnAccountReactionId,
                type: "initial",
                currentNodeId: nextNodeIdParallel.id,
                oldNodeId: currentNode.id,
              });
            }
            return;
          })
          .catch((error) => {
            console.log("ERROR NO NodeListenReaction", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeSwitchVariable") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Switch de variáveis`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSwitchVariable({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactAccountId,
          accountId: props.accountId,
          numberLead: props.lead_id,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!d.handleId) {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed"),
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                ...(props.type === "running"
                  ? { message: props.message, type: "running" }
                  : { type: "initial" }),
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
              });
            }
            const isNextNodeMain = nextEdgesIds.find(
              (nh) => nh.sourceHandle === d.handleId,
            );
            if (!isNextNodeMain) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: isNextNodeMain.id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error: any) => {
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
      }
      if (currentNode.type === "NodeExtractVariable") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Extraindo valor de variável`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeExtractVariable({
          contactsWAOnAccountId: props.contactAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          nodeId: currentNodeId,
          numberLead: props.lead_id,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO NodeListenReaction", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeCharge") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Criando cobrança PIX`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeCharge({
          ...(props.mode === "prod"
            ? {
                data: { ...currentNode.data, businessId: props.businessId },
                contactsWAOnAccountId: props.contactAccountId,
                accountId: props.accountId,
                nodeId: currentNode.id,
                flowStateId: props.flowStateId,
                mode: "prod",
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            const isNextNodeMain = nextEdgesIds.find((nh) =>
              nh.sourceHandle?.includes(d),
            );
            if (!isNextNodeMain) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }
            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: isNextNodeMain.id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error: any) => {
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
      }
      if (currentNode.type === "NodeRandomCode") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Criando código aleatório`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeRandomCode({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactAccountId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar NodeRandomCode", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (props.mode === "prod" && currentNode.type === "NodeSendTextGroup") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeSendTextGroup({
          numberLead: props.lead_id,
          contactAccountId: props.contactAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionId: props.connectionId,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
          },
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeCreateOrder") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Criando pedido`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeCreateOrder({
          ...(props.mode === "prod"
            ? {
                lead_id: props.lead_id,
                contactAccountId: props.contactAccountId,
                connectionId: props.connectionId,
                data: { ...currentNode.data, businessId: props.businessId },
                accountId: props.accountId,
                businessName: props.businessName,
                nodeId: currentNode.id,
                flowStateId: props.flowStateId,
                flowId: props.flowId,
                ...(props.type === "running" && {
                  action: props.action?.replace(" [order]", "") || undefined,
                }),
                external_adapter: props.external_adapter,
                mode: "prod",
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async (action) => {
            const nextNode = nextEdgesIds.find(
              (s) => s.sourceHandle === "main",
            );
            if (!nextNode) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }

            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            if (!action) {
              execute({
                ...props,
                ...(props.type === "running"
                  ? { message: props.message, type: "running" }
                  : { type: "initial" }),
                currentNodeId: nextNode.id,
                oldNodeId: currentNode.id,
              });
            } else {
              execute({
                ...props,
                type: "running",
                message: action,
                currentNodeId: nextNode.id,
                oldNodeId: currentNode.id,
                ...(props.mode === "prod" && {
                  isSavePositionLead: false,
                }),
              });
            }
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeUpdateOrder") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Atualizando pedido`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeUpdateOrder({
          ...(props.mode === "prod"
            ? {
                numberLead: props.lead_id,
                contactsWAOnAccountId: props.contactAccountId,
                data: currentNode.data,
                accountId: props.accountId,
                businessName: props.businessName,
                nodeId: currentNode.id,
                flowStateId: props.flowStateId,
                mode: "prod",
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async (action) => {
            if (!action) {
              if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return;
              }
              if (props.actions?.onExecutedNode) {
                await props.actions?.onExecutedNode({
                  id: currentNode.id,
                  flowId: props.flowId,
                });
              }

              execute({
                ...props,
                ...(props.type === "running"
                  ? { message: props.message, type: "running" }
                  : { type: "initial" }),
                currentNodeId: nextEdgesIds[0].id,
                oldNodeId: currentNode.id,
              });
            } else {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("action"),
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              return execute({
                ...props,
                type: "running",
                message: action,
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
                ...(props.mode === "prod" && {
                  isSavePositionLead: false,
                }),
              });
            }
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (props.mode === "prod" && currentNode.type === "NodeTimedQueue") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        LibraryNodes.NodeTimedQueue({
          numberLead: props.lead_id,
          connectionId: props.connectionId,
          data: currentNode.data,
          nodeId: currentNode.id,
          executeDebounce: async () => {
            const nextNodeId = nextEdgesIds?.find(
              (nd) => nd.sourceHandle === "debounce",
            );
            if (!nextNodeId) {
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
            if (props.actions?.onExecutedNode) {
              await props.actions.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeId.id,
              oldNodeId: currentNode.id,
            });
          },
        });
        const nextNodeId = nextEdgesIds?.find(
          (nd) => nd.sourceHandle === "main",
        );
        if (!nextNodeId) {
          if (props.forceFinish) await props.actions?.onFinish?.("110");
          await props.actions?.onExecutedNode?.({
            id: "0",
            flowId: props.flowId,
          });
          cacheFlowInExecution.delete(keyMap);
          return res();
        }
        if (props.actions?.onExecutedNode) {
          await props.actions.onExecutedNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }

        return execute({
          ...props,
          actions: {
            onErrorClient: props.actions?.onErrorClient,
            onErrorNumber: props.actions?.onErrorNumber,
          },
          type: "initial",
          currentNodeId: nextNodeId.id,
          oldNodeId: currentNode.id,
        });
      }
      if (currentNode.type === "NodeCalculator") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Acessando calculadora`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeCalculator({
          data: currentNode.data,
          nodeId: currentNode.id,
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
        });
        const nextNodeId = nextEdgesIds?.find(
          (nd) => nd.sourceHandle === "main",
        );
        if (!nextNodeId) {
          if (props.forceFinish) await props.actions?.onFinish?.("110");
          await props.actions?.onExecutedNode?.({
            id: "0",
            flowId: props.flowId,
          });
          cacheFlowInExecution.delete(keyMap);
          return res();
        }
        if (props.actions?.onExecutedNode) {
          await props.actions.onExecutedNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        return execute({
          ...props,
          ...(props.type === "running"
            ? { message: props.message, type: "running" }
            : { type: "initial" }),
          currentNodeId: nextNodeId.id,
          oldNodeId: currentNode.id,
        });
      }
      if (props.mode === "prod" && currentNode.type === "NodeAddTrelloCard") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeAddTrelloCard({
          data: currentNode.data,
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          nodeId: currentNode.id,
          numberLead: props.lead_id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              currentNodeId: nextEdgesIds[0].id,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeRemoveTrelloCard") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Removendo Card do Trello`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeRemoveTrelloCard({
          data: currentNode.data,
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              currentNodeId: nextEdgesIds[0].id,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeMoveTrelloCard") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Movendo Card do Trello`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeMoveTrelloCard({
          data: currentNode.data,
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              currentNodeId: nextEdgesIds[0].id,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeUpdateTrelloCard") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Atualizando Card do trello`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeUpdateTrelloCard({
          data: currentNode.data,
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          nodeId: currentNode.id,
          numberLead: props.lead_id,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return res();
            }

            return execute({
              ...props,
              currentNodeId: nextEdgesIds[0].id,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              oldNodeId: currentNode.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      if (currentNode.type === "NodeWebhookTrelloCard") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Card do Trello mudou de posição`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        if (
          props.type === "running" &&
          props.afterName &&
          props.beforeName &&
          props.cardId
        ) {
          await LibraryNodes.NodeWebhookTrelloCard({
            data: currentNode.data,
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactAccountId,
            beforeName: props.beforeName,
            afterName: props.afterName,
            cardId: props.cardId,
          })
            .then(async (ac) => {
              if (ac === "return") return res();
              if (props.actions?.onExecutedNode) {
                await props.actions?.onExecutedNode({
                  id: currentNode.id,
                  flowId: props.flowId,
                });
              }
              if (!nextEdgesIds.length) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }

              return execute({
                ...props,
                currentNodeId: nextEdgesIds[0].id,
                ...(props.type === "running"
                  ? { message: props.message, type: "running" }
                  : { type: "initial" }),
                oldNodeId: currentNode.id,
              });
            })
            .catch((error) => {
              console.log("error ao executar nodeAddTags", error);
              cacheFlowInExecution.delete(keyMap);
              props.actions?.onErrorNumber && props.actions?.onErrorNumber();
              return res();
            });
        }
        return res();
      }
      if (props.mode === "prod" && currentNode.type === "NodeDeleteMessage") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeDeleteMessage({
          numberLead: props.lead_id,
          contactsWAOnAccountId: props.contactAccountId,
          data: currentNode.data,
          connectionWhatsId: props.connectionId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            execute({
              ...props,
              ...(props.type === "running"
                ? { message: props.message, type: "running" }
                : { type: "initial" }),
              currentNodeId: nextEdgesIds[0].id,
              oldNodeId: currentNode.id,
            });
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeDistribute") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Mudando o fluxo de conversa de direção`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        const saida = await LibraryNodes.NodeDistribute({
          data: currentNode.data,
        });

        const nextNodeId = nextEdgesIds?.find((nd) =>
          nd.sourceHandle?.includes(saida),
        );
        if (!nextNodeId) {
          if (props.forceFinish) await props.actions?.onFinish?.("110");
          await props.actions?.onExecutedNode?.({
            id: "0",
            flowId: props.flowId,
          });
          cacheFlowInExecution.delete(keyMap);
          return res();
        }

        if (props.actions?.onExecutedNode) {
          await props.actions?.onExecutedNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }

        return execute({
          ...props,
          currentNodeId: nextNodeId.id,
          oldNodeId: currentNode.id,
          ...(props.type === "running"
            ? { message: props.message, type: "running" }
            : { type: "initial" }),
        });
      }
      if (currentNode.type === "NodeCreateAppointment") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Criando agendamento`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeCreateAppointment({
          ...(props.mode === "prod"
            ? {
                numberLead: props.lead_id,
                contactsWAOnAccountId: props.contactAccountId,
                data: { ...currentNode.data, businessId: props.businessId },
                accountId: props.accountId,
                businessName: props.businessName,
                connectionWhatsId: props.connectionId,
                nodeId: currentNode.id,
                flowStateId: props.flowStateId,
                flowId: props.flowId,
                ...(props.type === "running" && {
                  action:
                    props.action?.replace(" [appointment]", "") || undefined,
                }),
                external_adapter: props.external_adapter,
                mode: "prod",
              }
            : {
                mode: "testing",
                accountId: props.accountId,
                token_modal_chat_template: props.token_modal_chat_template,
              }),
        })
          .then(async (action) => {
            const nextNode = nextEdgesIds.find(
              (s) => s.sourceHandle === "main",
            );
            if (!nextNode) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }

            if (props.actions?.onExecutedNode) {
              await props.actions?.onExecutedNode({
                id: currentNode.id,
                flowId: props.flowId,
              });
            }

            if (!action) {
              execute({
                ...props,
                ...(props.type === "running"
                  ? { message: props.message, type: "running" }
                  : { type: "initial" }),
                currentNodeId: nextNode.id,
                oldNodeId: currentNode.id,
              });
            } else {
              execute({
                ...props,
                type: "running",
                message: action,
                currentNodeId: nextNode.id,
                oldNodeId: currentNode.id,
                ...(props.mode === "prod" && {
                  isSavePositionLead: false,
                }),
              });
            }
            return;
          })
          .catch((error) => {
            console.log("ERROR NO Appointment", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }
      if (currentNode.type === "NodeUpdateAppointment") {
        if (props.mode === "testing") {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Log: Atualizando agendamento`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
        }
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            flowId: props.flowId,
          });
        }
        await LibraryNodes.NodeUpdateAppointment({
          numberLead: props.lead_id,
          contactsWAOnAccountId: props.contactAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          nodeId: currentNode.id,
        })
          .then(async (action) => {
            console.log({ action });
            if (action.n === "not_found") {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              await props.actions?.onExecutedNode?.({
                id: "0",
                flowId: props.flowId,
              });
              return;
            }
            if (action.n === "ok") {
              if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return;
              }
              if (props.actions?.onExecutedNode) {
                await props.actions?.onExecutedNode({
                  id: currentNode.id,
                  flowId: props.flowId,
                });
              }

              return execute({
                ...props,
                ...(props.type === "running"
                  ? { message: props.message, type: "running" }
                  : { type: "initial" }),
                currentNodeId: nextEdgesIds[0].id,
                oldNodeId: currentNode.id,
              });
            }

            if (action.n === "no_transfer" || action.n === "transfer") {
              const currentNode2 = props.nodes.find(
                (f) => f.id === action.nodeId,
              );

              if (!currentNode) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                await props.actions?.onExecutedNode?.({
                  id: "0",
                  flowId: props.flowId,
                });
                return res();
              }
              const nextEdgesIds2 = props.edges
                .filter((f) => currentNode2?.id === f.source)
                ?.map((nn) => {
                  const node = props.nodes.find((f) => f.id === nn.target);
                  return {
                    id: nn.target,
                    sourceHandle: nn.sourceHandle,
                    nodeNextType: node?.type,
                  };
                });
              const nextNode = nextEdgesIds2.find((s) =>
                s.sourceHandle?.includes(action.status),
              );
              if (!nextNode) {
                if (action.n === "transfer") {
                  cacheFlowInExecution.delete(keyMap);
                  if (props.forceFinish) await props.actions?.onFinish?.("110");
                  await props.actions?.onExecutedNode?.({
                    id: "0",
                    flowId: props.flowId,
                  });
                }
                return;
              }
              if (props.actions?.onExecutedNode) {
                await props.actions?.onExecutedNode({
                  id: currentNode.id,
                  flowId: props.flowId,
                });
              }

              if (action.n === "transfer") {
                return execute({
                  ...props,
                  ...(props.type === "running"
                    ? { message: props.message, type: "running" }
                    : { type: "initial" }),
                  currentNodeId: nextNode.id,
                  oldNodeId: currentNode.id,
                });
              } else {
                execute({
                  ...props,
                  ...(props.type === "running"
                    ? { message: props.message, type: "running" }
                    : { type: "initial" }),
                  currentNodeId: nextNode.id,
                  oldNodeId: currentNode.id,
                  ...(props.mode === "prod" && {
                    isSavePositionLead: false,
                  }),
                  actions: undefined,
                });
                return execute({
                  ...props,
                  ...(props.type === "running"
                    ? { message: props.message, type: "running" }
                    : { type: "initial" }),
                  currentNodeId: nextEdgesIds[0].id,
                  oldNodeId: currentNode.id,
                });
              }
            }
            return;
          })
          .catch((error) => {
            console.log("ERROR NO MENSAGEM", error);
            cacheFlowInExecution.delete(keyMap);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return;
      }

      return res();
    };
    execute({ ...propsC, currentNodeId, oldNodeId });
  });
};
