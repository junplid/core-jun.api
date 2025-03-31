import { sessionsBaileysWA } from "../../adapters/Baileys";
import { GetConnectionsWADTO_I } from "./DTO";
import { GetConnectionsWARepository_I } from "./Repository";

export class GetConnectionsWAUseCase {
  constructor(private repository: GetConnectionsWARepository_I) {}

  async run(dto: GetConnectionsWADTO_I) {
    const connections = await this.repository.fetch(dto);

    const nextConnections = await Promise.all(
      connections.map(async (cnn) => {
        try {
          const isConnected = sessionsBaileysWA
            .get(cnn.id)
            ?.ev.emit("connection.update", { connection: "open" });
          return { ...cnn, status: !!isConnected ? "open" : "close" };
        } catch (error) {
          console.log("Error", error);
          return { ...cnn, status: "close" };
        }
      })
    );

    return {
      message: "OK!",
      status: 200,
      connections: nextConnections,
    };
  }
}
