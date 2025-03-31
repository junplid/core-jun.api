import { GetChabotsForSelectRepository_I } from "./Repository";
import { GetChabotsForSelectDTO_I } from "./DTO";
import { sessionsBaileysWA } from "../../adapters/Baileys";

export class GetChabotsForSelectUseCase {
  constructor(private repository: GetChabotsForSelectRepository_I) {}

  async run(dto: GetChabotsForSelectDTO_I) {
    const data = await this.repository.fetch(dto);

    const nextData = data.map(({ connectionOnBusinessId, status, ...r }) => {
      if (!connectionOnBusinessId) {
        return { ...r, statusChatbot: status, statusConn: false };
      }
      const isConnected = sessionsBaileysWA
        .get(connectionOnBusinessId)
        ?.ev.emit("connection.update", { connection: "open" });
      return { ...r, statusChatbot: status, statusConn: !!isConnected };
    });

    return {
      message: "OK!",
      status: 200,
      chatbot: nextData,
    };
  }
}
