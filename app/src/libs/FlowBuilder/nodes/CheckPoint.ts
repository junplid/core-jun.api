import { prisma } from "../../../adapters/Prisma/client";
import { NodeCheckPointData } from "../Payload";

interface PropsNodeCheckPoint {
  data: NodeCheckPointData;
  contactsWAOnAccountId: number;
  nodeId: string;
}

export const NodeCheckPoint = (props: PropsNodeCheckPoint): Promise<void> =>
  new Promise(async (res, rej) => {
    const { contactsWAOnAccountId, data } = props;

    const checkPointOnBusinessIds = await prisma.checkPoint.update({
      where: { id: data.checkPointId },
      select: {
        CheckPointOnBusiness: { select: { id: true } },
      },
      data: { score: { increment: 1 } },
    });

    if (checkPointOnBusinessIds?.CheckPointOnBusiness.length) {
      const { CheckPointOnBusiness } = checkPointOnBusinessIds;
      CheckPointOnBusiness.forEach(async ({ id }) => {
        await prisma.checkPointOnBusiness.update({
          where: { id },
          data: {
            CheckPointOnBusinessOnContactWAOnAccount: {
              create: {
                contactsWAOnAccountId: contactsWAOnAccountId,
                flowId: 1,
              },
            },
          },
        });
      });
    } else {
      rej("`checkPointOnBusinessIds` not found!");
    }

    res();
  });
