import { GetConnectionsWARootDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { sessionsBaileysWA } from "../../adapters/Baileys";

export class GetConnectionsWARootUseCase {
  constructor() {}

  async run(dto: GetConnectionsWARootDTO_I) {
    const connections = await prisma.rootConnectionWA.findMany({
      select: { id: true, Connection: { select: { name: true, id: true } } },
    });

    const nextConnections = await Promise.all(
      connections.map(async ({ Connection, ...cnn }) => {
        try {
          if (!Connection) return null;
          const isConnected = sessionsBaileysWA
            .get(Connection.id)
            ?.ev.emit("connection.update", { connection: "open" });
          return {
            ...cnn,
            name: Connection.name,
            status: !!isConnected,
          };
        } catch (error) {
          if (!Connection) return null;
          return { ...cnn, name: Connection.name, status: false };
        }
      })
    );

    return {
      message: "OK!",
      status: 200,
      connections: nextConnections.filter((s) => s),
    };
  }
}
