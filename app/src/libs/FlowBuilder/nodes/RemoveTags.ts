import { prisma } from "../../../adapters/Prisma/client";
import { NodeAddTagsData } from "../Payload";

interface PropsNodeAction {
  data: NodeAddTagsData;
  flowStateId: number;
  contactAccountId: number;
  nodeId: string;
}

export const NodeRemoveTags = (props: PropsNodeAction): Promise<void> =>
  new Promise(async (res, _rej) => {
    const { data, contactAccountId } = props;

    for await (const tagId of data.list) {
      const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
        where: { contactsWAOnAccountId: contactAccountId, tagId },
        select: { id: true },
      });
      if (isExist) {
        await prisma.tagOnContactsWAOnAccount.delete({
          where: { id: isExist.id },
        });
      }
    }

    return res();
  });
