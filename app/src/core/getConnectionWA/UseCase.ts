import { TypeConnetion } from "@prisma/client";
import { Contact } from "baileys";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { GetConnectionWADTO_I } from "./DTO";
import { GetConnectionWARepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

interface IConnection {
  id: number;
  type: TypeConnetion;
  name: string;
  createAt: Date;
  status: string;
  business: string;
  countTickets: number;
  updatedAt: Date;
  campaigns: string[];
  countShots: number;
  number: string | null;
  userProfile?: Omit<Contact, "lid" | "id">;
}

export class GetConnectionWAUseCase {
  constructor(private repository: GetConnectionWARepository_I) {}

  async run(dto: GetConnectionWADTO_I) {
    const connection = await this.repository.fetch(dto.id);

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não foi encontrada!`,
        type: "error",
      });
    }

    const bot = sessionsBaileysWA.get(dto.id);

    if (bot) {
      const isConnected = bot.ev.emit("connection.update", {
        connection: "open",
      });
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

    const { Chatbot, Business, ConnectionOnCampaign, _count, ...conn } =
      connection;

    Object.assign(conn, {
      business: Business.name,
      countTickets: _count.Tickets,
      campaigns: ConnectionOnCampaign.map(({ CampaignOnBusiness }) => {
        return CampaignOnBusiness.Campaign;
      }),
      chatbots: Chatbot.map(({ name }) => name),
    });

    return {
      message: "OK!",
      status: 200,
      connection: conn,
    };
  }
}
