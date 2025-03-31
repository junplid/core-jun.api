import { prisma } from "../../../adapters/Prisma/client";
import { NodeInsertLeaderInAudienceData } from "../Payload";

interface PropsNodeInsertLeaderInAudience {
  data: NodeInsertLeaderInAudienceData;
  contactsWAOnAccountId: number;
  nodeId: string;
}

export const NodeInsertLeaderInAudience = (
  props: PropsNodeInsertLeaderInAudience
): Promise<void> =>
  new Promise(async (res, rej) => {
    const { data, contactsWAOnAccountId } = props;

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

    return res();
  });
