import { GetConnectionsWARootDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetConnectionsWARootUseCase {
  constructor() {}

  async run(dto: GetConnectionsWARootDTO_I) {
    const connections = await prisma.rootConnectionWA.findMany({
      select: { id: true, ConnectionWA: { select: { name: true, id: true } } },
    });

    const nextConnections = await Promise.all(
      connections.map(async ({ ConnectionWA, ...cnn }) => {
        try {
          if (!ConnectionWA) return null;
          const isConnected = !!cacheConnectionsWAOnline.get(cnn.id);
          return {
            ...cnn,
            name: ConnectionWA.name,
            status: !!isConnected,
          };
        } catch (error) {
          if (!ConnectionWA) return null;
          return { ...cnn, name: ConnectionWA.name, status: false };
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
