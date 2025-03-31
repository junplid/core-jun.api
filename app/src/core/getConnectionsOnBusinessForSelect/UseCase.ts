import { sessionsBaileysWA } from "../../adapters/Baileys";
import { GetConnectionsOnBusinessForSelectDTO_I } from "./DTO";
import { GetConnectionsOnBusinessForSelectRepository_I } from "./Repository";

export class GetConnectionsOnBusinessForSelectUseCase {
  constructor(
    private repository: GetConnectionsOnBusinessForSelectRepository_I
  ) {}

  async run(dto: GetConnectionsOnBusinessForSelectDTO_I) {
    const connections = await this.repository.fetch(dto);

    const nextConnections = await Promise.all(
      connections.map(async (cnn) => {
        try {
          const client = sessionsBaileysWA.get(cnn.id);
          const isConnected = client?.ev.emit("connection.update", {
            connection: "open",
          });
          return {
            ...cnn,
            name: isConnected ? cnn.name + " - ON" : cnn.name + " - OFF",
          };
        } catch (error) {
          return { ...cnn, name: cnn.name + " - OFF" };
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
