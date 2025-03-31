import { prisma } from "../../adapters/Prisma/client";
import { CreateConnectionsWARootDTO_I } from "./DTO";

export class CreateConnectionsWARootUseCase {
  constructor() {}

  async run({ rootId, ...dto }: CreateConnectionsWARootDTO_I) {
    dto.connections.forEach(async (con) => {
      const exist = await prisma.rootConnectionWA.count({
        where: { connectionId: con },
      });
      if (!exist) {
        await prisma.rootConnectionWA.create({
          data: { connectionId: con },
        });
      }
    });

    return { message: "OK!", status: 201 };
  }
}
