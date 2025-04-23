import { sessionsBaileysWA } from "../../adapters/Baileys";
import { GetConnectionWADetailsDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetConnectionWADetailsUseCase {
  constructor() {}

  async run(dto: GetConnectionWADetailsDTO_I) {
    const connection = await prisma.connectionWA.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        type: true,
        id: true,
        // quantidade de envio de mensagem que inicia a conversa no periodo de 24hrs sem receber mensagem do lead
        // countShots: true,
        updateAt: true,
        number: true,
        Chatbot: { select: { name: true, id: true } },
        Business: { select: { name: true, id: true } },
        createAt: true,
      },
    });

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não foi encontrada!`,
        type: "error",
      });
    }

    const bot = sessionsBaileysWA.get(dto.id);

    if (bot) {
      const isConnected = !!cacheConnectionsWAOnline.get(dto.id);
      Object.assign(connection, {
        status: !!isConnected ? "open" : "close",
      });
      if (bot.user) {
        const { id, lid, ...userProfile } = bot.user;
        const nextJid = id.replace(/:\d*/, "");
        const imgUrl = await bot.profilePictureUrl(nextJid);
        Object.assign(connection, { userProfile: { ...userProfile, imgUrl } });
      }
    } else {
      Object.assign(connection, { status: "close" });
    }

    const { Chatbot, Business, ...conn } = connection;

    // Object.assign(conn, {
    //   business: Business.name,
    //   countTickets: _count.Tickets,
    //   campaigns: ConnectionOnCampaign.map(({ CampaignOnBusiness }) => {
    //     return CampaignOnBusiness.Campaign;
    //   }),
    //   chatbots: Chatbot.map(({ name }) => name),
    // });

    return {
      message: "OK!",
      status: 200,
      connectionWA: { ...conn, business: Business.name, chatbot: Chatbot },
    };
  }
}
