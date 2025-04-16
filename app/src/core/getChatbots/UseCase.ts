import { GetChabotsDTO_I } from "./DTO";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";

export class GetChabotsUseCase {
  constructor() {}

  async run(dto: GetChabotsDTO_I) {
    const data = await prisma.chatbot.findMany({
      where: {
        accountId: dto.accountId,
        ...(dto.type?.length && { typeActivation: { in: dto.type } }),
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
      if (!ConnectionWA) {
        return {
          ...r,
          status: "OFF",
          // source: null,
        };
      }

      const isConnected = sessionsBaileysWA
        .get(ConnectionWA.id)
        ?.ev.emit("connection.update", { connection: "open" });

      // let source: null | string = null;
      // if (r.inputActivation && ConnectionWA.number) {
      //   source = `https://api.whatsapp.com/send?phone=${ConnectionWA.number}&text=${r.inputActivation}`;
      // }

      return {
        ...r,
        // source,
        status: isConnected && status ? "ON" : "OFF",
      };
    });

    return {
      message: "OK!",
      status: 200,
      chatbots: nextData,
    };
  }
}
