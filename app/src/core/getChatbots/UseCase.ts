import { GetChabotsRepository_I } from "./Repository";
import { GetChabotsDTO_I } from "./DTO";
import { sessionsBaileysWA } from "../../adapters/Baileys";

export class GetChabotsUseCase {
  constructor(private repository: GetChabotsRepository_I) {}

  async run(dto: GetChabotsDTO_I) {
    const data = await this.repository.fetch(dto);

    const nextData = data.map(
      ({ ConnectionOnBusiness, status, typeActivation, ...r }) => {
        if (!ConnectionOnBusiness) {
          return { ...r, statusChatbot: "OFF", statusConn: "OFF" };
        }

        const isConnected = sessionsBaileysWA
          .get(ConnectionOnBusiness.id)
          ?.ev.emit("connection.update", { connection: "open" });

        let target: null | string = null;
        if (r.inputActivation && ConnectionOnBusiness.number) {
          target = `https://api.whatsapp.com/send?phone=${ConnectionOnBusiness.number}&text=${r.inputActivation}`;
        }

        return {
          ...r,
          type: typeActivation,
          target,
          statusChatbot: !!status ? "ON" : "OFF",
          statusConn: !!isConnected ? "ON" : "OFF",
        };
      }
    );

    return {
      message: "OK!",
      status: 200,
      chatbots: nextData,
    };
  }
}
