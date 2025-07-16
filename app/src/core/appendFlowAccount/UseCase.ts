import { AppendFlowAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { ulid } from "ulid";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { NodePayload } from "../../libs/FlowBuilder/Payload";

export class AppendFlowAccountUseCase {
  constructor() {}

  async run({ rootId, ...dto }: AppendFlowAccountDTO_I) {
    const alreadyExists = await prisma.account.findFirst({
      where: { email: dto.email },
      select: { id: true },
    });

    if (!alreadyExists) {
      throw new ErrorResponse(400).input({
        text: `Conta não encontrada.`,
        path: "email",
      });
    }

    const { nodes, edges, businessIds, ...rest } = JSON.parse(dto.data);

    const getSystemVars = await prisma.variable.findMany({
      where: { type: "system" },
      select: { name: true },
    });
    const listSystemVars = getSystemVars.map((s) => s.name);

    async function syncVariables(list: string[]) {
      for await (const variable of list) {
        if (listSystemVars.includes(variable)) continue;

        const getVar = await prisma.variable.findFirst({
          where: { name: variable, accountId: alreadyExists!.id },
          select: { id: true },
        });
        if (getVar) continue;
        await prisma.variable.create({
          data: {
            accountId: alreadyExists!.id,
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
            })
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
                where: { accountId: alreadyExists.id, name: getTag.name },
                select: { id: true },
              });
              if (!existAccount) {
                const { id } = await prisma.tag.create({
                  data: {
                    accountId: alreadyExists.id,
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
          })
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
                where: { accountId: alreadyExists.id, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId: alreadyExists.id,
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
            data: { name: getBusiness.name, accountId: alreadyExists.id },
            select: { id: true },
          });
          node.data.businessId = id;
        }

        let appendText = "";
        if (node.data.data) appendText += `${node.data.data} \n`;
        if (node.data.delivery_address)
          appendText += `${node.data.delivery_address} \n`;
        if (node.data.delivery_method)
          appendText += `${node.data.delivery_method} \n`;
        if (node.data.description) appendText += `${node.data.description} \n`;
        if (node.data.name) appendText += `${node.data.name} \n`;
        if (node.data.origin) appendText += `${node.data.origin} \n`;
        if (node.data.total) appendText += `${node.data.total} \n`;

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
              where: { accountId: alreadyExists.id, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId: alreadyExists.id,
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
              where: { accountId: alreadyExists.id, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId: alreadyExists.id,
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
              where: { accountId: alreadyExists.id, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId: alreadyExists.id,
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
                where: { accountId: alreadyExists.id, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId: alreadyExists.id,
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
          })
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
              where: { accountId: alreadyExists.id, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId: alreadyExists.id,
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
              where: { accountId: alreadyExists.id, name: getVar.name },
              select: { id: true },
            });
            if (!isVarExist?.id) {
              const { id } = await prisma.variable.create({
                data: {
                  accountId: alreadyExists.id,
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
      } else if (node.type === "NodeRandomCode") {
        const getVar = await prisma.variable.findFirst({
          where: { id: node.data.id, type: "dynamics" },
          select: { name: true },
        });
        if (getVar) {
          const isVarExist = await prisma.variable.findFirst({
            where: { accountId: alreadyExists.id, name: getVar.name },
            select: { id: true },
          });
          if (!isVarExist) {
            const { id } = await prisma.variable.create({
              data: {
                accountId: alreadyExists.id,
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
                where: { accountId: alreadyExists.id, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId: alreadyExists.id,
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
          })
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
                where: { accountId: alreadyExists.id, name: getVar.name },
                select: { id: true },
              });
              if (!isVarExist) {
                const { id } = await prisma.variable.create({
                  data: {
                    accountId: alreadyExists.id,
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
          })
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
            where: { accountId: alreadyExists.id, name: getVar.name },
            select: { id: true },
          });
          if (!isVarExist) {
            const { id } = await prisma.variable.create({
              data: {
                accountId: alreadyExists.id,
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
        if (node.data.delivery_method)
          appendText += `${node.data.delivery_method} \n`;
        if (node.data.description) appendText += `${node.data.description} \n`;
        if (node.data.name) appendText += `${node.data.name} \n`;
        if (node.data.origin) appendText += `${node.data.origin} \n`;
        if (node.data.total) appendText += `${node.data.total} \n`;
        if (node.data.nOrder) appendText += `${node.data.nOrder} \n`;
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
                where: { accountId: alreadyExists.id, name: getTag.name },
                select: { id: true },
              });
              if (!existAccount) {
                const { id } = await prisma.tag.create({
                  data: {
                    accountId: alreadyExists.id,
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
          })
        );
        node.data.list = newList;
      }
    }

    await ModelFlows.create({
      ...{
        accountId: alreadyExists.id,
        _id: ulid(),
        ...rest,
        data: { nodes, edges },
      },
    });

    return { status: 200, message: "OK" };
  }
}
