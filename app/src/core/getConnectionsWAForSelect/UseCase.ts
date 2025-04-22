import { sessionsBaileysWA } from "../../adapters/Baileys";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionsWAForSelectDTO_I } from "./DTO";

export class GetConnectionsWAForSelectUseCase {
  constructor() {}

  async run(dto: GetConnectionsWAForSelectDTO_I) {
    const connections = await prisma.connectionWA.findMany({
      where: {
        ...(dto.type && { type: dto.type }),
        ...(dto.businessIds?.length && { businessId: { in: dto.businessIds } }),
        Business: { accountId: dto.accountId },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const nextConnections = await Promise.all(
      connections.map(async (cnn) => {
        try {
          const isConnected = !!cacheConnectionsWAOnline.get(cnn.id);
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
      connectionsWA: nextConnections,
    };
  }
}
