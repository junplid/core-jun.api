import { prisma } from "../../../adapters/Prisma/client";
import { NodeSwitchData } from "../Payload";

interface PropsNodeReply {
  data: NodeSwitchData;
  contactsWAOnAccountId: number;
  nodeId: string;
}

type ResultPromise = { handleId?: string };

export const NodeSwitch = (props: PropsNodeReply): Promise<ResultPromise> =>
  new Promise(async (res, rej) => {
    const { data, contactsWAOnAccountId } = props;

    if (data.type === "tag") {
      const { possibleTags } = data;
      const possibleTagsIds = possibleTags.map((ps) => ps.tagId);
      const tagValid =
        await prisma.tagOnBusinessOnContactsWAOnAccount.findFirst({
          where: {
            contactsWAOnAccountId,
            TagOnBusiness: {
              tagId: { in: possibleTagsIds },
            },
          },
          select: {
            TagOnBusiness: {
              select: { tagId: true },
            },
          },
        });
      const handleId = possibleTags.find(
        (ps) => ps.tagId === tagValid?.TagOnBusiness.tagId
      )?.key;
      return res({ handleId });
    }
    const { variableId, possibleValues } = data;
    let handleId: string | undefined = undefined;
    for await (const { value, key } of possibleValues) {
      const is = await prisma.variable.count({
        where: {
          id: variableId,
          VariableOnBusiness: {
            some: {
              ContactsWAOnAccountVariableOnBusiness: {
                some: { value },
              },
            },
          },
        },
      });
      if (is) handleId = key;
    }
    console.log("TA BATENDO AQUI!");
    return res({ handleId });
  });
