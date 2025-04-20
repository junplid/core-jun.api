import { sessionsBaileysWA } from "../../adapters/Baileys";
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
      connectionsWA: nextConnections,
    };
  }
}
