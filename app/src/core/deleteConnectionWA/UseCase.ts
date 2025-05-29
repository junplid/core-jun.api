import fs from "fs-extra";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { DeleteConnectionWADTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteConnectionWAUseCase {
  constructor() {}

  async run(dto: DeleteConnectionWADTO_I) {
    const connection = await prisma.connectionWA.findFirst({
      where: {
        id: dto.id,
        Business: { accountId: dto.accountId },
      },
      select: { name: true, type: true },
    });

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title:
          "Conexão não encontrada ou você não tem permissão para apaga-la.",
        type: "error",
      });
    }

    await prisma.connectionWA.delete({
      where: { id: dto.id, Business: { accountId: dto.accountId } },
    });

    const client = sessionsBaileysWA.get(dto.id);
    if (client) {
      client?.end(
        // @ts-expect-error
        `Force disconection: ${dto.id} - ${connection.name} - ${connection.type}`
      );
    }

    const pathAuthBot = `./database-whatsapp/${dto.id}`;

    if (fs.existsSync(pathAuthBot)) {
      try {
        fs.removeSync(pathAuthBot);
      } catch (err) {
        console.error(`Ocorreu um erro ao excluir o diretório: ${err}`);
      }
    } else {
      console.log(`O diretório ${pathAuthBot} não existe.`);
    }

    return {
      message: "OK!",
      status: 200,
    };
  }
}
