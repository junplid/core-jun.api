import { GetConnectionsWARootForSelectDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

export class GetConnectionsWARootForSelectUseCase {
  constructor() {}

  async run(dto: GetConnectionsWARootForSelectDTO_I) {
    const connections = await prisma.connectionWA.findMany({
      where: {
        ...(dto.email && {
          Business: { Account: { email: { contains: dto.email } } },
        }),
      },
      select: { id: true, name: true },
    });

    const nextConnections = await Promise.all(
      connections.map(async (cnn) => {
        try {
          const isConnected = !!cacheConnectionsWAOnline.get(cnn.id);
          return {
            ...cnn,
            name: `${cnn.name} ${!!isConnected ? " (ON)" : " (OFF)"}`,
          };
        } catch (error) {
          return { ...cnn, name: `${cnn.name} (OFF)` };
        }
      })
    );

    return { message: "OK!", status: 200, connections: nextConnections };
  }
}
