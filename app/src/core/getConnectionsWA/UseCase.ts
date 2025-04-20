import { sessionsBaileysWA } from "../../adapters/Baileys";
import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionsWADTO_I } from "./DTO";

export class GetConnectionsWAUseCase {
  constructor() {}

  async run(dto: GetConnectionsWADTO_I) {
    const connections = await prisma.connectionWA.findMany({
      where: { Business: dto },
      select: {
        name: true,
        type: true,
        id: true,
        Business: { select: { name: true, id: true } },
        createAt: true,
      },
    });

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
      connectionsWA: nextConnections,
    };
  }
}
