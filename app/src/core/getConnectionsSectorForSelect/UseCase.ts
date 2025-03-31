import { sessionsBaileysWA } from "../../adapters/Baileys";
import { GetConnectionsSectorForSelectDTO_I } from "./DTO";
import { GetConnectionsSectorForSelectRepository_I } from "./Repository";

export class GetConnectionsSectorForSelectUseCase {
  constructor(private repository: GetConnectionsSectorForSelectRepository_I) {}

  async run(dto: GetConnectionsSectorForSelectDTO_I) {
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
