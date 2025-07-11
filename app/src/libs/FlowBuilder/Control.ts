import { WASocket } from "baileys";
import { prisma } from "../../adapters/Prisma/client";
import { LibraryNodes } from "./nodes";
import { NodePayload, TypeNodesPayload } from "./Payload";
import { cacheFlowInExecution } from "../../adapters/Baileys/Cache";

interface Edges {
  source: string;
  target: string;
  sourceHandle: string | null;
  id: string;
}

export type IPropsControler = {
  actions?: {
    onEnterNode?(props: { id: string; type: TypeNodesPayload }): Promise<void>;
    onExecutedNode?(
      props: { id: string; type: TypeNodesPayload },
      isShots?: boolean
    ): void;
    onFinish?(vl?: string): Promise<void>;
    onErrorNumber?(): void;
    onErrorClient?(indexNode: string): void;
  };
  oldNodeId: string;
  nodes: NodePayload[];
  ticketProtocol?: string;
  edges: Edges[];
  clientWA: WASocket;
  lead: { number: string };
  flowId: string;
  flowStateId: number;
  currentNodeId?: string;
  campaignId?: number;
  chatbotId?: number;
  connectionWhatsId: number;
  contactsWAOnAccountId: number;
  isSavePositionLead?: boolean;
  numberConnection: string;
  accountId: number;
  previous_response_id?: string;
  businessName: string;
  flowBusinessIds?: number[];
  forceFinish?: boolean;
} & (
  | { type: "initial" }
  | {
      type: "running";
      message: string;
      audio?: any;
      reactionText?: string;
      isMidia?: boolean;
    }
);

// responsável por executar o controle do fluxo de conversa e manipular caches
export const NodeControler = ({
  currentNodeId = "0",
  oldNodeId = "0",
  ...propsC
}: IPropsControler): Promise<void> => {
  const keyMap = `${propsC.connectionWhatsId}-${propsC.lead.number}`;

  return new Promise((res, rej) => {
    if (cacheFlowInExecution.has(keyMap)) {
      console.log("Já existe uma execução em andamento para este lead");
      return res();
    }
    cacheFlowInExecution.set(keyMap, true);
    const execute = async (props: IPropsControler): Promise<void> => {
      if (props.chatbotId) {
        await new Promise<void>(async (resP, rejP) => {
          async function verify() {
            const chatbot = await prisma.chatbot.findFirst({
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
        }).catch(() => {
          console.log("Error, chatbot não encontrado!");
          cacheFlowInExecution.delete(keyMap);
          return rej();
        });
      }

      if (props.campaignId) {
        await new Promise<void>(async (resP, rejP) => {
          async function verify() {
            const campaign = await prisma.campaign.findFirst({
              where: { id: props.campaignId },
              select: { status: true },
            });

            if (!campaign) return rejP();

            if (campaign.status === "paused" || campaign.status === "stopped") {
              setTimeout(() => verify(), 1000 * 60 * 3);
              return;
            }
            return resP();
          }
          verify();
        }).catch(() => {
          console.log("Error, campanha não encontrada!");
          return rej();
        });
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
        props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onExecutedNode) {
          props.actions?.onExecutedNode(currentNode);
        }
        if (!nextEdgesIds.length) {
          cacheFlowInExecution.delete(keyMap);
          if (props.forceFinish) await props.actions?.onFinish?.("110");
          props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
      if (currentNode.type === "NodeFinish") {
        if (props.actions?.onExecutedNode) {
          props.actions?.onExecutedNode(currentNode);
        }

        if (props.forceFinish) {
          await prisma.flowState.update({
            where: { id: props.flowStateId },
            data: { isFinish: true },
          });
        }
        props.actions?.onFinish?.();
        return;
      }
      if (currentNode.type === "NodeMessage") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeMessage({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
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
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }

            execute({
              ...props,
              type: "initial",
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeReply({
          numberLead: props.lead.number,
          numberConnection: props.numberConnection,
          data: currentNode.data,
          message: props.type === "initial" ? undefined : props.message,
          flowBusinessIds: props.flowBusinessIds,
          flowStateId: props.flowStateId,
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          async onExecuteSchedule() {
            const nextNodeId = nextEdgesIds?.find((nd) =>
              nd.sourceHandle?.includes("timeout")
            );
            if (!nextNodeId) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return res();
            }
            if (props.actions?.onExecutedNode) {
              props.actions.onExecutedNode(currentNode);
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeId.id,
              oldNodeId: currentNode.id,
            });
          },
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (d.action === "NEXT") {
              const isNextNodeMain = nextEdgesIds.find(
                (nh) => !nh.sourceHandle || nh.sourceHandle === "main"
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeMenu({
          numberLead: props.lead.number,
          numberConnection: props.numberConnection,
          data: currentNode.data,
          message: props.type === "initial" ? undefined : props.message,
          connectionWhatsId: props.connectionWhatsId,
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
              nd.sourceHandle?.includes("timeout")
            );
            if (!nextNodeId) {
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              cacheFlowInExecution.delete(keyMap);
              return res();
            }
            if (props.actions?.onExecutedNode) {
              props.actions.onExecutedNode(currentNode);
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeId.id,
              oldNodeId: currentNode.id,
            });
          },
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (d.action === "sucess") {
              const isNextNodeMain = nextEdgesIds.find(
                (nh) => nh.sourceHandle === d.sourceHandle
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
                nh.sourceHandle?.includes("failed")
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeAddTags({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeRemoveTags({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeAddVariables({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeRemoveVariables({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
      if (currentNode.type === "NodeSendFlow") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendFlow({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeIf({
          data: currentNode.data,
          accountId: props.accountId,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
          numberLead: props.lead.number,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return res();
            }

            const nextNodeId = nextEdgesIds.find((nd) =>
              nd.sourceHandle?.includes(JSON.stringify(d))
            );
            if (!nextNodeId) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode(currentNode);
        }
        await LibraryNodes.NodeTimer({
          data: currentNode.data,
          nodeId: currentNodeId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeNotifyWA({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
      if (currentNode.type === "NodeSendFiles") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendFiles({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          connectionWAId: props.connectionWhatsId,
          action: {},
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
      if (currentNode.type === "NodeSendVideos") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendVideos({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          connectionWAId: props.connectionWhatsId,
          action: {},
          nodeId: currentNode.id,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
      if (currentNode.type === "NodeSendImages") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendImages({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          connectionWAId: props.connectionWhatsId,
          action: {},
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
      if (currentNode.type === "NodeSendAudiosLive") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendAudiosLive({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          connectionWAId: props.connectionWhatsId,
          action: {},
          flowStateId: props.flowStateId,
          nodeId: currentNode.id,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
      if (currentNode.type === "NodeSendAudios") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendAudios({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          ticketProtocol: props.ticketProtocol,
          connectionWAId: props.connectionWhatsId,
          action: {},
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeAgentAI({
          numberLead: props.lead.number,
          numberConnection: props.numberConnection,
          data: currentNode.data,
          message: props.type === "initial" ? undefined : props.message,
          connectionWhatsId: props.connectionWhatsId,
          action: {
            onErrorClient: () => {
              if (props.oldNodeId === "0") {
                props.actions?.onErrorClient &&
                  props.actions?.onErrorClient(currentNode.id);
              }
            },
            onExecuteTimeout: async () => {
              const nextNodeId = nextEdgesIds?.find((nd) =>
                nd.sourceHandle?.includes("timeout")
              );
              if (!nextNodeId) {
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                cacheFlowInExecution.delete(keyMap);
                return res();
              }
              if (props.actions?.onExecutedNode) {
                props.actions.onExecutedNode(currentNode);
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: nextNodeId.id,
                oldNodeId: currentNode.id,
              });
            },
            onExitNode: async (NAME_HANDLE) => {
              // await prisma.flowState.update({
              //   where: { id: props.flowStateId },
              //   data: { previous_response_id: null },
              // });
              const nextNodeId = nextEdgesIds?.find((nd) =>
                nd.sourceHandle?.includes(NAME_HANDLE)
              );
              if (!nextNodeId) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                return res();
              }
              if (props.actions?.onExecutedNode) {
                props.actions.onExecutedNode(currentNode);
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: nextNodeId.id,
                oldNodeId: currentNode.id,
              });
            },
          },
          accountId: props.accountId,
          contactAccountId: props.contactsWAOnAccountId,
          previous_response_id: props.previous_response_id,
          flowStateId: props.flowStateId,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (d.action === "sucess") {
              const isNextNodeMain = nextEdgesIds.find(
                (nh) => nh.sourceHandle === d.sourceHandle
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
                nh.sourceHandle?.includes("failed")
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
      if (currentNode.type === "NodeTransferDepartment") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeTransferDepartment({
          data: currentNode.data,
          flowStateId: props.flowStateId,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          nodeId: currentNodeId,
          accountId: props.accountId,
          connectionWAId: props.connectionWhatsId,
        })
          .then(async (d) => {
            if (d === "OK") {
              if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                return;
              }
              props.actions?.onExecutedNode?.({
                id: nextEdgesIds[0].id,
                type: "NodeTransferDepartment",
              });
              return res();
            }
            if (d === "ERROR") {
              if (props.actions?.onExecutedNode) {
                props.actions?.onExecutedNode(currentNode);
              }
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed")
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
      if (currentNode.type === "NodeFbPixel") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeFbPixel({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
            type: currentNode.type,
          });
        }
        if (props.type !== "running") return res();
        await LibraryNodes.NodeListenReaction({
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          message: props.message,
          reactionText: props.reactionText || "",
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }

            execute({
              ...props,
              type: "initial",
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
      if (currentNode.type === "NodeSwitchVariable") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSwitchVariable({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          numberLead: props.lead.number,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!d.handleId) {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed")
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
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
              (nh) => nh.sourceHandle === d.handleId
            );
            if (!isNextNodeMain) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeExtractVariable({
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          nodeId: currentNodeId,
          numberLead: props.lead.number,
        })
          .then(async () => {
            if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeCharge({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          accountId: props.accountId,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async (d) => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            const isNextNodeMain = nextEdgesIds.find((nh) =>
              nh.sourceHandle?.includes(d)
            );
            if (!isNextNodeMain) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
      if (currentNode.type === "NodeRandomCode") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeRandomCode({
          data: currentNode.data,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
        })
          .then(async () => {
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }
            if (!nextEdgesIds.length) {
              cacheFlowInExecution.delete(keyMap);
              if (props.forceFinish) await props.actions?.onFinish?.("110");
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
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
      if (currentNode.type === "NodeSendTextGroup") {
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeSendTextGroup({
          botWA: props.clientWA,
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          ticketProtocol: props.ticketProtocol,
          connectionWhatsId: props.connectionWhatsId,
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
              props.actions?.onExecutedNode?.({ id: "0", type: "NodeInitial" });
              return;
            }
            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
            }

            execute({
              ...props,
              type: "initial",
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeCreateOrder({
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          connectionWhatsId: props.connectionWhatsId,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
          flowId: props.flowId,
          ...(props.type === "running" && { action: props.message }),
        })
          .then(async (action) => {
            if (!action) {
              if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                return;
              }
              if (props.actions?.onExecutedNode) {
                props.actions?.onExecutedNode(currentNode);
              }

              execute({
                ...props,
                type: "initial",
                currentNodeId: nextEdgesIds[0].id,
                oldNodeId: currentNode.id,
              });
            } else {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("action")
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                return res();
              }
              return execute({
                ...props,
                type: "running",
                message: action,
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
                isSavePositionLead: false,
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
        if (props.actions?.onEnterNode) {
          await props.actions?.onEnterNode({
            id: currentNode.id,
            type: currentNode.type,
          });
        }
        await LibraryNodes.NodeUpdateOrder({
          numberLead: props.lead.number,
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          data: currentNode.data,
          accountId: props.accountId,
          businessName: props.businessName,
          nodeId: currentNode.id,
          flowStateId: props.flowStateId,
        })
          .then(async (action) => {
            if (!action) {
              if (!nextEdgesIds.length || nextEdgesIds.length > 1) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                return;
              }
              if (props.actions?.onExecutedNode) {
                props.actions?.onExecutedNode(currentNode);
              }

              execute({
                ...props,
                type: "initial",
                currentNodeId: nextEdgesIds[0].id,
                oldNodeId: currentNode.id,
              });
            } else {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("action")
              );
              if (!isNextNodeMain) {
                cacheFlowInExecution.delete(keyMap);
                if (props.forceFinish) await props.actions?.onFinish?.("110");
                props.actions?.onExecutedNode?.({
                  id: "0",
                  type: "NodeInitial",
                });
                return res();
              }
              return execute({
                ...props,
                type: "running",
                message: action,
                currentNodeId: isNextNodeMain.id,
                oldNodeId: currentNode.id,
                isSavePositionLead: false,
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

      return res();
    };

    execute({ ...propsC, currentNodeId, oldNodeId });
  });
};
