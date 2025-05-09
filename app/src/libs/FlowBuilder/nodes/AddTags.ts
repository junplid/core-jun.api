import { prisma } from "../../../adapters/Prisma/client";
import { NodeAddTagsData } from "../Payload";

interface PropsNodeAction {
  data: NodeAddTagsData;
  flowStateId: number;
  contactsWAOnAccountId: number;
  nodeId: string;
}

export const NodeAddTags = (props: PropsNodeAction): Promise<void> =>
  new Promise(async (res, _rej) => {
    const { data, contactsWAOnAccountId } = props;

    for await (const tagId of data.list) {
      const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
        where: { contactsWAOnAccountId, tagId },
      });
      if (!isExist) {
        await prisma.tagOnContactsWAOnAccount.create({
          data: { contactsWAOnAccountId, tagId },
        });
      }
    }

    return res();
  });
