import { flowsMap } from "../../../adapters/Baileys/Cache";
import { prisma } from "../../../adapters/Prisma/client";
import { ModelFlows } from "../../../adapters/mongo/models/flows";
import { NodeActionData } from "../Payload";

interface PropsNodeAction {
  data: NodeActionData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  nodeId: string;
}

type ResultPromise =
  | { action: "CONTINUE" }
  | { action: "END_FLOW" }
  | { action: "SUBMIT_FLOW"; nodes: any; edges: any };

export const NodeAction = (props: PropsNodeAction): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    const { data, contactsWAOnAccountId } = props;

    console.log({ dataType: data.type });
    if (data.type === "finish-flow") {
      await prisma.flowState.update({
        where: { id: props.flowStateId },
        data: { isFinish: true },
      });
      return res({ action: "END_FLOW" });
    }

    if (data.type === "add-tag") {
      const tagOnBusinessIds = await prisma.tag.findFirst({
        where: { id: data.tagId, type: "contactwa" },
        select: {
          TagOnBusiness: {
            select: {
              id: true,
            },
          },
        },
      });

      tagOnBusinessIds?.TagOnBusiness.forEach(async ({ id }) => {
        const isExist =
          await prisma.tagOnBusinessOnContactsWAOnAccount.findFirst({
            where: { contactsWAOnAccountId, tagOnBusinessId: id },
          });
        if (!isExist) {
          await prisma.tagOnBusinessOnContactsWAOnAccount.create({
            data: { contactsWAOnAccountId, tagOnBusinessId: id },
          });
        }
      });
      return res({ action: "CONTINUE" });
    }

    if (data.type === "remove-tag") {
      const tagOnBusinessIds = await prisma.tag.findFirst({
        where: { id: data.tagId, type: "contactwa" },
        select: {
          TagOnBusiness: {
            select: {
              id: true,
            },
          },
        },
      });

      if (tagOnBusinessIds?.TagOnBusiness.length) {
        await Promise.all(
          tagOnBusinessIds?.TagOnBusiness.map(async ({ id }) => {
            const tagOnBusinessOnCId =
              await prisma.tagOnBusinessOnContactsWAOnAccount.findFirst({
                where: { contactsWAOnAccountId, tagOnBusinessId: id },
                select: { id: true },
              });

            if (tagOnBusinessOnCId?.id) {
              await prisma.tagOnBusinessOnContactsWAOnAccount.delete({
                where: { id: tagOnBusinessOnCId.id },
              });
            }
          })
        );
      }
      return res({ action: "CONTINUE" });
    }

    if (data.type === "send-flow") {
      let flowAlreadyExists = flowsMap.get(String(data.flowId));
      console.log({ flowAlreadyExists });
      if (!flowAlreadyExists) {
        const newFlow = await ModelFlows.aggregate([
          {
            $match: {
              _id: data.flowId,
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
        flowsMap.set(data.flowId.toString(), {
          nodes,
          edges,
        });
        flowAlreadyExists = { nodes, edges };
      }

      await prisma.flowState.update({
        where: { id: props.flowStateId },
        data: { flowId: data.flowId },
      });
      console.log("Enviou para o controller");
      return res({
        action: "SUBMIT_FLOW",
        ...flowAlreadyExists,
      });
    }

    if (data.type === "variable") {
      const businessIdsOnVariable = await prisma.variableOnBusiness.findMany({
        where: { variableId: data.variableId },
        select: {
          id: true,
          ContactsWAOnAccountVariableOnBusiness: { select: { id: true } },
        },
      });
      for await (const {
        ContactsWAOnAccountVariableOnBusiness,
        id,
      } of businessIdsOnVariable) {
        const variableOnBusinessId = id;
        if (!ContactsWAOnAccountVariableOnBusiness.length) {
          await prisma.contactsWAOnAccountVariableOnBusiness.create({
            data: {
              value: data.value,
              contactsWAOnAccountId: props.contactsWAOnAccountId,
              variableOnBusinessId,
            },
          });
        } else {
          ContactsWAOnAccountVariableOnBusiness.forEach(async (id) => {
            await prisma.contactsWAOnAccountVariableOnBusiness
              .upsert({
                where: id,
                create: {
                  value: data.value,
                  contactsWAOnAccountId: props.contactsWAOnAccountId,
                  variableOnBusinessId,
                },
                update: {
                  value: data.value,
                  contactsWAOnAccountId: props.contactsWAOnAccountId,
                  variableOnBusinessId,
                },
              })
              .catch((err) => console.log("ERROR VARIAVEL", err));
          });
        }
      }
      return res({ action: "CONTINUE" });
    }

    if (data.type === "add-to-audience") {
      const isExist = await prisma.contactsWAOnAccountOnAudience.findFirst({
        where: {
          audienceId: data.audienceId,
          contactWAOnAccountId: contactsWAOnAccountId,
        },
      });
      if (!isExist) {
        await prisma.contactsWAOnAccountOnAudience.create({
          data: {
            audienceId: data.audienceId,
            contactWAOnAccountId: contactsWAOnAccountId,
          },
        });
      }
      return res({ action: "CONTINUE" });
    }
    if (data.type === "remove-to-audience") {
      const audience = await prisma.contactsWAOnAccountOnAudience.findFirst({
        where: {
          audienceId: data.audienceId,
          contactWAOnAccountId: contactsWAOnAccountId,
        },
        select: { id: true },
      });

      if (audience) {
        await prisma.contactsWAOnAccountOnAudience.delete({
          where: { id: audience.id },
        });
      }
      return res({ action: "CONTINUE" });
    }

    return res({ action: "CONTINUE" });
  });
