import { WASocket } from "baileys";
import { prisma } from "../../adapters/Prisma/client";
import { LibraryNodes } from "./nodes";
import { NodePayload } from "./Payload";

export type TypesNode =
  | "NodeInitial"
  | "NodeMessage"
  | "NodeReply"
  | "NodeAddTags"
  | "NodeRemoveTags"
  | "NodeRemoveVariables"
  | "NodeAddVariables"
  | "NodeSendFlow"
  | "NodeTimer"
  | "NodeMenu"
  | "NodeIF";

interface Edges {
  source: string;
  target: string;
  sourceHandle: string | null;
  id: string;
}

export type IPropsControler = {
  actions?: {
    onEnterNode?(props: { id: string; type: TypesNode }): Promise<void>;
    onExecutedNode?(
      props: { id: string; type: TypesNode },
      isShots?: boolean
    ): void;
    onFinish?(vl?: string): Promise<void>;
    onErrorNumber?(): void;
  };
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
  businessName: string;
  flowBusinessIds?: number[];
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
}: IPropsControler): Promise<void> => {
  // const keyMap = propsC.numberConnection + propsC.lead.number;

  return new Promise((res, rej) => {
    const execute = async (
      props: IPropsControler & { currentNodeId: string }
    ): Promise<void> => {
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

            if (!chatbot) return rejP();
            if (chatbot.interrupted) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }
            if (chatbot.Business.interrupted) {
              setTimeout(() => verify, 1000 * 60 * 3);
              return;
            }
            if (!chatbot.ConnectionWA) {
              return rejP();
            }
            if (chatbot.ConnectionWA.interrupted) {
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

      // if (props.campaignId) {
      //   await new Promise<void>(async (resP, rejP) => {
      //     async function verify() {
      //       const campaign = await prisma.campaign.findFirst({
      //         where: { id: props.campaignId },
      //         select: {
      //           interrupted: true,
      //           CampaignOnBusiness: {
      //             select: {
      //               ConnectionOnCampaign: {
      //                 where: {
      //                   connectionOnBusinessId: props.connectionWhatsId,
      //                 },
      //                 select: {
      //                   ConnectionOnBusiness: { select: { interrupted: true } },
      //                 },
      //               },
      //               Business: { select: { interrupted: true } },
      //             },
      //           },
      //         },
      //       });

      //       if (!campaign) return rejP();

      //       const allBusinessInterruped = campaign.CampaignOnBusiness.map(
      //         (s) => s.Business.interrupted
      //       ).every((s) => s);

      //       if (allBusinessInterruped) {
      //         setTimeout(() => verify, 1000 * 60 * 3);
      //         return;
      //       }
      //       if (campaign.interrupted) {
      //         setTimeout(() => verify, 1000 * 60 * 3);
      //         return;
      //       }

      //       const allConnectionsInterruped = campaign.CampaignOnBusiness.map(
      //         (s) => {
      //           return s.ConnectionOnCampaign.map(
      //             (v) => v.ConnectionOnBusiness.interrupted
      //           );
      //         }
      //       )
      //         .flat()
      //         .every((s) => s);

      //       if (allConnectionsInterruped) {
      //         setTimeout(() => verify, 1000 * 60 * 3);
      //         return;
      //       }

      //       return resP();
      //     }
      //     verify();
      //   }).catch(() => {
      //     console.log("Error, campanha não encontrada!");
      //     return rej();
      //   });

      //   const findCampaign = await prisma.campaign.count({
      //     where: {
      //       id: props.campaignId,
      //       status: { in: ["paused", "finished"] },
      //     },
      //   });

      //   if (findCampaign) {
      //     return props.onFinish && (await props.onFinish("112"));
      //   }
      // }

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
        props.actions?.onFinish && (await props.actions?.onFinish("110"));
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
      if (currentNode.type === "NodeInitial") {
        if (props.actions?.onExecutedNode) {
          props.actions?.onExecutedNode(currentNode);
        }
        if (!nextEdgesIds.length) {
          props.actions?.onFinish && (await props.actions?.onFinish("110"));
          return res();
        }
        const isDepend = nextEdgesIds[0].nodeNextType === "NodeReply";
        if (isDepend) return res();

        execute({
          ...props,
          // type:
          //   nextEdgesIds[0].nodeNextType === "nodeAttendantAI"
          //     ? "running"
          //     : "initial",
          type: "initial",
          currentNodeId: nextEdgesIds[0].id,
        });
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
        })
          .then(async () => {
            if (!nextEdgesIds.length) {
              props.actions?.onFinish && (await props.actions?.onFinish("128"));
              return;
            }
            if (nextEdgesIds.length > 1) {
              props.actions?.onFinish && (await props.actions?.onFinish("140"));
              return;
            }

            if (props.actions?.onExecutedNode) {
              props.actions?.onExecutedNode(currentNode);
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
              props.actions?.onFinish && (await props.actions.onFinish("307"));
              return res();
            }
            if (props.isSavePositionLead && props.actions?.onExecutedNode) {
              props.actions.onExecutedNode(currentNode);
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeId.id,
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
                props.actions?.onFinish && props.actions?.onFinish("332");
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
              });
            }
            if (d.action === "RETURN") return res();
          })
          .catch((error: any) => {
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
          async onExecuteSchedule() {
            const nextNodeId = nextEdgesIds?.find((nd) =>
              nd.sourceHandle?.includes("timeout")
            );
            if (!nextNodeId) {
              props.actions?.onFinish && (await props.actions.onFinish("307"));
              return res();
            }
            if (props.isSavePositionLead && props.actions?.onExecutedNode) {
              props.actions.onExecutedNode(currentNode);
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeId.id,
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
                props.actions?.onFinish && props.actions?.onFinish("332");
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
              });
            }
            if (d.action === "return") return res();
            if (d.action === "failAttempt") return res();
            if (d.action === "failed") {
              const isNextNodeMain = nextEdgesIds.find((nh) =>
                nh.sourceHandle?.includes("failed")
              );
              if (!isNextNodeMain) {
                props.actions?.onFinish && props.actions?.onFinish("332");
                return res();
              }
              return execute({
                ...props,
                type: "initial",
                currentNodeId: isNextNodeMain.id,
              });
            }
          })
          .catch((error: any) => {
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
              props.actions?.onFinish && props.actions?.onFinish("1280");
              return res();
            }

            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
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
              props.actions?.onFinish && props.actions?.onFinish("1280");
              return res();
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
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
              props.actions?.onFinish && props.actions?.onFinish("1280");
              return res();
            }

            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
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
              props.actions?.onFinish && props.actions?.onFinish("1280");
              return res();
            }

            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
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
              nodes: d.nodes,
              edges: d.edges,
              flowBusinessIds: d.businessIds,
              flowId: d.flowId,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
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
              props.actions?.onFinish && props.actions?.onFinish("1280");
              return res();
            }

            const nextNodeId = nextEdgesIds.find((nd) =>
              nd.sourceHandle?.includes(JSON.stringify(d))
            );
            if (!nextNodeId) {
              props.actions?.onFinish && (await props.actions.onFinish("307"));
              return res();
            }
            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextNodeId.id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
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
              props.actions?.onFinish && props.actions?.onFinish("1280");
              return res();
            }

            return execute({
              ...props,
              type: "initial",
              currentNodeId: nextEdgesIds[0].id,
            });
          })
          .catch((error) => {
            console.log("error ao executar nodeAddTags", error);
            props.actions?.onErrorNumber && props.actions?.onErrorNumber();
            return res();
          });
        return res();
      }
      return res();
    };

    execute({ ...propsC, currentNodeId });
  });
};
