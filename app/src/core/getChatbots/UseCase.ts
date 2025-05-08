import { GetChabotsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetChabotsUseCase {
  constructor() {}

  async run(dto: GetChabotsDTO_I) {
    const data = await prisma.chatbot.findMany({
      where: {
        accountId: dto.accountId,
      },
      select: {
        name: true,
        id: true,
        createAt: true,
        status: true,
        ConnectionWA: { select: { id: true, number: true } },
        Business: { select: { name: true, id: true } },
      },
    });

    const nextData = data.map(({ ConnectionWA, status, ...r }) => {
      if (!ConnectionWA || !status) {
        return {
          ...r,
          status: false,
          // source: null,
        };
      }

      // let source: null | string = null;
      // if (r.inputActivation && ConnectionWA.number) {
      //   source = `https://api.whatsapp.com/send?phone=${ConnectionWA.number}&text=${r.inputActivation}`;
      // }

      return {
        ...r,
        // source,
        status: !!cacheConnectionsWAOnline.get(ConnectionWA.id) && status,
      };
    });

    return {
      message: "OK!",
      status: 200,
      chatbots: nextData,
    };
  }
}
