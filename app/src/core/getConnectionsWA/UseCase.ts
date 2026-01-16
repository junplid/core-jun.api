import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionsWADTO_I } from "./DTO";

export class GetConnectionsWAUseCase {
  constructor() {}

  async run(dto: GetConnectionsWADTO_I) {
    const connections = await prisma.connectionWA.findMany({
      where: { Business: dto },
      orderBy: { id: "desc" },
      select: {
        name: true,
        type: true,
        id: true,
        Business: { select: { name: true, id: true } },
        createAt: true,
        AgentAI: { select: { id: true, name: true } },
      },
    });

    const nextConnections = await Promise.all(
      connections.map(async (cnn) => {
        try {
          const isConnected = !!cacheConnectionsWAOnline.get(cnn.id);
          return { ...cnn, status: !!isConnected ? "open" : "close" };
        } catch (error) {
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
