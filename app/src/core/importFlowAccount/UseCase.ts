import { ImportFlowAccountDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ulid } from "ulid";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { NodePayload } from "../../libs/FlowBuilder/Payload";
import { mongo } from "../../adapters/mongo/connection";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class ImportFlowAccountUseCase {
  constructor() {}

  async run({ accountId, flowId }: ImportFlowAccountDTO_I) {
    const businessAccount = await prisma.business.findFirst({
      where: { accountId },
      select: { id: true, name: true },
    });
    await mongo();

    const flow = await ModelFlows.findOne({ _id: flowId }).lean();

    if (!flow) {
      throw new ErrorResponse(400).input({
        path: "flowId",
        text: "Fluxo não encontrado!",
      });
    }

    const {
      data: { nodes, edges },
      businessIds,
      ...rest
    } = flow;

    const getSystemVars = await prisma.variable.findMany({
      where: { type: "system" },
      select: { name: true },
    });
    const listSystemVars = getSystemVars.map((s) => s.name);

    async function syncVariables(list: string[]) {
      for await (const variable of list) {
        if (listSystemVars.includes(variable)) continue;

        const getVar = await prisma.variable.findFirst({
          where: { name: variable, accountId },
          select: { id: true },
        });
        if (getVar) continue;
        await prisma.variable.create({
          data: {
            accountId,
            name: variable,
            type: "dynamics",
          },
        });
      }
    }

    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index] as NodePayload;

      if (node.type === "NodeMessage") {
        if (node.data.messages?.length) {
          await Promise.all(
            node.data.messages.map(async (message) => {
              const hasVariable = (message.text || "").match(/{{\w+}}/g);
              if (!hasVariable) return;
              const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
              if (!variables.length) return;
              await syncVariables(variables);
              if (message.varId) {
                const getVar = await prisma.variable.findFirst({
                  where: { id: message.varId, type: "dynamics" },
                  select: { name: true },
                });
                if (getVar) {
                  const isVarExist = await prisma.variable.findFirst({
                    where: { accountId, name: getVar.name },
                    select: { id: true },
                  });
                  if (!isVarExist) {
                    const { id } = await prisma.variable.create({
                      data: {
                        accountId,
                        name: getVar.name,
                        type: "dynamics",
                      },
                      select: { id: true },
                    });
                    message.varId = id;
                  } else {
                    message.varId = isVarExist.id;
                  }
                }
              }
            }),
          );
        }
      } else if (node.type === "NodeSendImages") {
        if (node.data.caption) {
          const hasVariable = node.data.caption.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeAddTags") {
        const newList = await Promise.all(
          node.data.list.map(async (tag) => {
            const getTag = await prisma.tag.findFirst({
              where: { id: tag },
              select: { name: true, type: true },
            });
            if (getTag) {
              const existAccount = await prisma.tag.findFirst({
                where: { accountId, name: getTag.name },
                select: { id: true },
              });
              if (!existAccount) {
                const { id } = await prisma.tag.create({
                  data: { accountId, ...getTag },
                  select: { id: true },
                });
                tag = id;
              } else {
                tag = existAccount.id;
              }
            }
            return tag;
          }),
        );
        node.data.list = newList;
      } else if (node.type === "NodeAgentAI") {
        if (!node.data.prompt) continue;
        const hasVariable = node.data.prompt.match(/{{\w+}}/g);
        if (!hasVariable) continue;
        const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
        if (!variables.length) continue;
        await syncVariables(variables);
      } else if (node.type === "NodeCharge") {
        let appendText = "";
        if (node.data.content) appendText += `${node.data.content} \n`;
        if (node.data.currency) appendText += `${node.data.currency} \n`;
        if (node.data.total) appendText += `${node.data.total} \n`;

        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }

        for await (const [key, value] of Object.entries(node.data)) {
          if (key.includes("varId_") && value) {
            const getVar = await prisma.variable.findFirst({
              where: { id: value as number, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                // @ts-expect-error
                node.data[key] = id;
              } else {
                // @ts-expect-error
                node.data[key] = isVarExist.id;
              }
            }
          }
        }
      } else if (node.type === "NodeCreateOrder") {
        const getBusiness = await prisma.business.findFirst({
          where: { id: node.data.businessId },
          select: { name: true },
        });
        if (getBusiness) {
          const { id } = await prisma.business.create({
            data: { name: getBusiness.name, accountId },
            select: { id: true },
          });
          node.data.businessId = id;
        }

        let appendText = "";
        if (node.data.data) appendText += `${node.data.data} \n`;
        if (node.data.delivery_address)
          appendText += `${node.data.delivery_address} \n`;
        if (node.data.payment_method)
          appendText += `${node.data.payment_method} \n`;
        if (node.data.description) appendText += `${node.data.description} \n`;
        if (node.data.name) appendText += `${node.data.name} \n`;
        if (node.data.origin) appendText += `${node.data.origin} \n`;
        if (node.data.total) appendText += `${node.data.total} \n`;
        if (node.data.sync_order_existing_code)
          appendText += `${node.data.sync_order_existing_code} \n`;

        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (!variables.length) await syncVariables(variables);
          }
        }

        if (node.data.varId_save_nOrder) {
          const getVar = await prisma.variable.findFirst({
            where: {
              id: node.data.varId_save_nOrder as number,
              type: "dynamics",
            },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_save_nOrder = id;
            } else {
              node.data.varId_save_nOrder = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeExtractVariable") {
        if (node.data.value) {
          const hasVariable = node.data.value.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
        if (node.data.var1Id) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.var1Id as number },
            select: { name: true, type: true },
          });
          if (getVar && getVar.type !== "system") {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: getVar.type,
                },
                select: { id: true },
              });
              node.data.var1Id = id;
            } else {
              node.data.var1Id = isVarExist.id;
            }
          }
        }
        if (node.data.var2Id) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.var2Id as number, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.var2Id = id;
            } else {
              node.data.var2Id = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeAddVariables") {
        const newList = await Promise.all(
          node.data.list.map(async (variable) => {
            const getVar = await prisma.variable.findFirst({
              where: { id: variable.id, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                variable.id = id;
              } else {
                variable.id = isVarExist.id;
              }
            }
            return variable;
          }),
        );
        node.data.list = newList;
      } else if (node.type === "NodeListenReaction") {
        if (node.data.varIdToMessage) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varIdToMessage, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varIdToMessage = id;
            } else {
              node.data.varIdToMessage = isVarExist.id;
            }
          }
        }
        if (node.data.varIdToReaction) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varIdToReaction, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist?.id) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varIdToReaction = id;
            } else {
              node.data.varIdToReaction = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeMenu") {
        if (node.data.validateReply?.messageErrorAttempts?.value) {
          const value = node.data.validateReply?.messageErrorAttempts?.value;
          const hasVariable = value.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeFbPixel") {
        for await (const [_, value] of Object.entries(node.data.event)) {
          const hasVariable = (value as string).match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (!variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeNotifyWA") {
        const hasVariable = node.data.text.match(/{{\w+}}/g);
        if (hasVariable) {
          const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
          if (!variables.length) await syncVariables(variables);
        }
        if (node.data.tagIds) {
          const newList = await Promise.all(
            node.data.tagIds.map(async (tag) => {
              const getTag = await prisma.tag.findFirst({
                where: { id: tag },
                select: { name: true, type: true },
              });
              if (getTag) {
                const existAccount = await prisma.tag.findFirst({
                  where: { accountId, name: getTag.name },
                  select: { id: true },
                });
                if (!existAccount) {
                  const { id } = await prisma.tag.create({
                    data: { accountId, ...getTag },
                    select: { id: true },
                  });
                  tag = id;
                } else {
                  tag = existAccount.id;
                }
              }
              return tag;
            }),
          );
          node.data.tagIds = newList;
        }
        if (node.data.ignoreTagIds) {
          const newList = await Promise.all(
            node.data.ignoreTagIds.map(async (tag) => {
              const getTag = await prisma.tag.findFirst({
                where: { id: tag },
                select: { name: true, type: true },
              });
              if (getTag) {
                const existAccount = await prisma.tag.findFirst({
                  where: { accountId, name: getTag.name },
                  select: { id: true },
                });
                if (!existAccount) {
                  const { id } = await prisma.tag.create({
                    data: { accountId, ...getTag },
                    select: { id: true },
                  });
                  tag = id;
                } else {
                  tag = existAccount.id;
                }
              }
              return tag;
            }),
          );
          node.data.ignoreTagIds = newList;
        }
        if (node.data.numbersWithTagIds) {
          const newList = await Promise.all(
            node.data.numbersWithTagIds.map(async (tag) => {
              const getTag = await prisma.tag.findFirst({
                where: { id: tag },
                select: { name: true, type: true },
              });
              if (getTag) {
                const existAccount = await prisma.tag.findFirst({
                  where: { accountId, name: getTag.name },
                  select: { id: true },
                });
                if (!existAccount) {
                  const { id } = await prisma.tag.create({
                    data: { accountId, ...getTag },
                    select: { id: true },
                  });
                  tag = id;
                } else {
                  tag = existAccount.id;
                }
              }
              return tag;
            }),
          );
          node.data.numbersWithTagIds = newList;
        }
      } else if (node.type === "NodeRandomCode") {
        const getVar = await prisma.variable.findFirst({
          where: { id: node.data.id, type: "dynamics" },
          select: { name: true },
        });
        if (getVar) {
          const isVarExist = await prisma.variable.findFirst({
            where: { accountId, name: getVar.name },
            select: { id: true },
          });
          if (!isVarExist) {
            const { id } = await prisma.variable.create({
              data: {
                accountId,
                name: getVar.name,
                type: "dynamics",
              },
              select: { id: true },
            });
            node.data.id = id;
          } else {
            node.data.id = isVarExist.id;
          }
        }
      } else if (node.type === "NodeRemoveVariables") {
        const newList = await Promise.all(
          node.data.list.map(async (varId) => {
            const getVar = await prisma.variable.findFirst({
              where: { id: varId, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                varId = id;
              } else {
                varId = isVarExist.id;
              }
            }
            return varId;
          }),
        );
        node.data.list = newList;
      } else if (node.type === "NodeReply") {
        if (!node.data.isSave) continue;
        if (!node.data.list?.length) continue;
        const newList = await Promise.all(
          node.data.list.map(async (varId) => {
            const getVar = await prisma.variable.findFirst({
              where: { id: varId, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                varId = id;
              } else {
                varId = isVarExist.id;
              }
            }
            return varId;
          }),
        );
        node.data.list = newList;
      } else if (node.type === "NodeSendFiles") {
        if (node.data.caption) {
          const hasVariable = node.data.caption.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeSendTextGroup") {
        const text = (node.data.messages || []).map((s) => s.text).join("\n");
        const hasVariable = text.match(/{{\w+}}/g);
        if (hasVariable) {
          const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
          if (variables.length) await syncVariables(variables);
        }
      } else if (node.type === "NodeSendVideos") {
        if (node.data.caption) {
          const hasVariable = node.data.caption.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeSwitchVariable") {
        const getVar = await prisma.variable.findFirst({
          where: { id: node.data.id, type: "dynamics" },
          select: { name: true },
        });
        if (getVar) {
          const isVarExist = await prisma.variable.findFirst({
            where: { accountId, name: getVar.name },
            select: { id: true },
          });
          if (!isVarExist) {
            const { id } = await prisma.variable.create({
              data: {
                accountId,
                name: getVar.name,
                type: "dynamics",
              },
              select: { id: true },
            });
            node.data.id = id;
          } else {
            node.data.id = isVarExist.id;
          }
        }
        const text = (node.data.values || []).map((s) => s.v).join("\n");
        const hasVariable = text.match(/{{\w+}}/g);
        if (hasVariable) {
          const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
          if (!variables.length) await syncVariables(variables);
        }
      } else if (node.type === "NodeUpdateOrder") {
        let appendText = "";
        if (node.data.data) appendText += `${node.data.data} \n`;
        if (node.data.delivery_address)
          appendText += `${node.data.delivery_address} \n`;
        if (node.data.payment_method)
          appendText += `${node.data.payment_method} \n`;
        if (node.data.description) appendText += `${node.data.description} \n`;
        if (node.data.name) appendText += `${node.data.name} \n`;
        if (node.data.origin) appendText += `${node.data.origin} \n`;
        if (node.data.total) appendText += `${node.data.total} \n`;
        if (node.data.nOrder) appendText += `${node.data.nOrder} \n`;
        if (node.data.charge_transactionId)
          appendText += `${node.data.charge_transactionId} \n`;
        if (node.data.tracking_code)
          appendText += `${node.data.tracking_code} \n`;

        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeRemoveTags") {
        const newList = await Promise.all(
          node.data.list.map(async (tag) => {
            const getTag = await prisma.tag.findFirst({
              where: { id: tag },
              select: { name: true, type: true },
            });
            if (getTag) {
              const existAccount = await prisma.tag.findFirst({
                where: { accountId, name: getTag.name },
                select: { id: true },
              });
              if (!existAccount) {
                const { id } = await prisma.tag.create({
                  data: {
                    accountId,
                    ...getTag,
                  },
                  select: { id: true },
                });
                tag = id;
              } else {
                tag = existAccount.id;
              }
            }
            return tag;
          }),
        );
        node.data.list = newList;
      } else if (node.type === "NodeAddTrelloCard") {
        if (node.data.varId_save_cardId) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_save_cardId, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_save_cardId = id;
            } else {
              node.data.varId_save_cardId = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeAppendRouter") {
        let appendText = "";
        if (node.data.max) appendText += `${node.data.max} \n`;
        if (node.data.nOrder) appendText += `${node.data.nOrder} \n`;
        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }

        if (node.data.varId_save_nRouter) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_save_nRouter, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_save_nRouter = id;
            } else {
              node.data.varId_save_nRouter = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeCalculator") {
        const hasVariable = (node.data.formula || "").match(/{{\w+}}/g);
        if (hasVariable) {
          const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
          if (variables.length) await syncVariables(variables);
        }
        if (node.data.variableId) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.variableId, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.variableId = id;
            } else {
              node.data.variableId = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeCreateAppointment") {
        let appendText = "";
        if (node.data.title) appendText += `${node.data.title} \n`;
        if (node.data.startAt) appendText += `${node.data.startAt} \n`;
        if (node.data.desc) appendText += `${node.data.desc} \n`;
        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }

        if (node.data.varId_save_nAppointment) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_save_nAppointment, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_save_nAppointment = id;
            } else {
              node.data.varId_save_nAppointment = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeDeleteMessage") {
        if (node.data.varId_groupJid) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_groupJid, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_groupJid = id;
            } else {
              node.data.varId_groupJid = isVarExist.id;
            }
          }
        }
        if (node.data.varId_messageId) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_messageId, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_messageId = id;
            } else {
              node.data.varId_messageId = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeDeleteOrder") {
        if (node.data.nOrder) {
          const hasVariable = node.data.nOrder.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeDeleteRouterOrder") {
        if (node.data.nOrder) {
          const hasVariable = node.data.nOrder.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeGetOrder") {
        if (node.data.nOrder_deliveryCode) {
          const hasVariable = node.data.nOrder_deliveryCode.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }

        for await (const [key, value] of Object.entries(node.data)) {
          if (key.includes("varId_") && value) {
            const getVar = await prisma.variable.findFirst({
              where: { id: value as number, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                // @ts-expect-error
                node.data[key] = id;
              } else {
                // @ts-expect-error
                node.data[key] = isVarExist.id;
              }
            }
          }
        }
      } else if (node.type === "NodeGetRouter") {
        let appendText = "";
        if (node.data.nRouter) appendText += `${node.data.nRouter} \n`;
        if (node.data.order_status_of)
          appendText += `${node.data.order_status_of} \n`;
        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }

        for await (const [key, value] of Object.entries(node.data)) {
          if (key.includes("varId_") && value) {
            const getVar = await prisma.variable.findFirst({
              where: { id: value as number, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                // @ts-expect-error
                node.data[key] = id;
              } else {
                // @ts-expect-error
                node.data[key] = isVarExist.id;
              }
            }
          }
        }
      } else if (node.type === "NodeIF") {
        for await (const item of node.data.list || []) {
          if (item.name === "appointment") {
            if (item.value1) {
              const hasVariable = item.value1.match(/{{\w+}}/g);
              if (hasVariable) {
                const variables = hasVariable.map((s) =>
                  s.replace(/{{|}}/g, ""),
                );
                if (variables.length) await syncVariables(variables);
              }
            }
            continue;
          }
          if (item.name === "has-tags" || item.name === "no-tags") {
            const newList = await Promise.all(
              item.tagIds.map(async (tag) => {
                const getTag = await prisma.tag.findFirst({
                  where: { id: tag },
                  select: { name: true, type: true },
                });
                if (getTag) {
                  const existAccount = await prisma.tag.findFirst({
                    where: { accountId, name: getTag.name },
                    select: { id: true },
                  });
                  if (!existAccount) {
                    const { id } = await prisma.tag.create({
                      data: { accountId, ...getTag },
                      select: { id: true },
                    });
                    tag = id;
                  } else {
                    tag = existAccount.id;
                  }
                }
                return tag;
              }),
            );
            item.tagIds = newList;
            continue;
          }
          if (item.name === "var") {
            let appendText = "";
            if (item.value1) appendText += `${item.value1} \n`;
            if (item.value2) appendText += `${item.value2} \n`;
            if (appendText) {
              const hasVariable = appendText.match(/{{\w+}}/g);
              if (hasVariable) {
                const variables = hasVariable.map((s) =>
                  s.replace(/{{|}}/g, ""),
                );
                if (variables.length) await syncVariables(variables);
              }
            }
            continue;
          }
        }
      } else if (node.type === "NodeMoveTrelloCard") {
        if (node.data.varId_cardId) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_cardId, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_cardId = id;
            } else {
              node.data.varId_cardId = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeNearestOrder") {
        if (node.data.varId_save_code_order) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_save_code_order, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_save_code_order = id;
            } else {
              node.data.varId_save_code_order = isVarExist.id;
            }
          }
        }
        if (node.data.geo_string) {
          const hasVariable = node.data.geo_string.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeRemoveTrelloCard") {
        if (node.data.varId_cardId) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_cardId, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_cardId = id;
            } else {
              node.data.varId_cardId = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeUpdateAppointment") {
        let appendText = "";
        if (node.data.desc) appendText += `${node.data.desc} \n`;
        if (node.data.n_appointment)
          appendText += `${node.data.n_appointment} \n`;
        if (node.data.startAt) appendText += `${node.data.startAt} \n`;
        if (node.data.title) appendText += `${node.data.title} \n`;
        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeUpdateRouter") {
        let appendText = "";
        if (node.data.max) appendText += `${node.data.max} \n`;
        if (node.data.nOrder) appendText += `${node.data.nOrder} \n`;
        if (node.data.nRouter) appendText += `${node.data.nRouter} \n`;
        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
      } else if (node.type === "NodeUpdateTrelloCard") {
        let appendText = "";
        if (node.data.desc) appendText += `${node.data.desc} \n`;
        if (node.data.name) appendText += `${node.data.name} \n`;
        if (appendText) {
          const hasVariable = appendText.match(/{{\w+}}/g);
          if (hasVariable) {
            const variables = hasVariable.map((s) => s.replace(/{{|}}/g, ""));
            if (variables.length) await syncVariables(variables);
          }
        }
        if (node.data.varId_cardId) {
          const getVar = await prisma.variable.findFirst({
            where: { id: node.data.varId_cardId, type: "dynamics" },
            select: { name: true },
          });
          if (getVar) {
            const isVarExist = await prisma.variable.findFirst({
              where: { accountId, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId,
                  name: getVar.name,
                  type: "dynamics",
                },
                select: { id: true },
              });
              node.data.varId_cardId = id;
            } else {
              node.data.varId_cardId = isVarExist.id;
            }
          }
        }
      } else if (node.type === "NodeWebhookTrelloCard") {
        for await (const [key, value] of Object.entries(node.data)) {
          if (key.includes("varId_") && value) {
            const getVar = await prisma.variable.findFirst({
              where: { id: value as number, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                // @ts-expect-error
                node.data[key] = id;
              } else {
                // @ts-expect-error
                node.data[key] = isVarExist.id;
              }
            }
          }
        }
      } else if (node.type === "NodeGetMenuOnline") {
        for await (const [key, value] of Object.entries(node.data)) {
          if (key.includes("varId_") && value) {
            const getVar = await prisma.variable.findFirst({
              where: { id: value as number, type: "dynamics" },
              select: { name: true },
            });
            if (getVar) {
              const isVarExist = await prisma.variable.findFirst({
                where: { accountId, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId,
                    name: getVar.name,
                    type: "dynamics",
                  },
                  select: { id: true },
                });
                // @ts-expect-error
                node.data[key] = id;
              } else {
                // @ts-expect-error
                node.data[key] = isVarExist.id;
              }
            }
          }
        }
      }
    }

    const nodeUnique = Math.floor(Date.now() / 1000);

    const { _id, createdAt, updatedAt } = await ModelFlows.create({
      ...{
        ...rest,
        accountId,
        _id: ulid(),
        name: `import(${rest.name}) ${nodeUnique}`,
        businessIds: businessAccount?.id ? [businessAccount.id] : undefined,
        data: { nodes, edges },
      },
    });

    return {
      status: 200,
      message: "OK",
      flow: {
        id: _id,
        name: `import(${rest.name}) ${nodeUnique}`,
        type: rest.type,
        businesses: businessAccount || undefined,
        createAt: createdAt,
        updateAt: updatedAt,
      },
    };
  }
}
