import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetConnectionWADTO_I } from "./DTO";

export class GetConnectionWAUseCase {
  constructor() {}

  async run(dto: GetConnectionWADTO_I) {
    const connection = await prisma.connectionWA.findUnique({
      where: { id: dto.id, Business: { accountId: dto.accountId } },
      select: {
        description: true,
        name: true,
        type: true,
        businessId: true,
        ConnectionConfig: {
          select: {
            fileNameImgPerfil: true,
            groupsAddPrivacy: true,
            imgPerfilPrivacy: true,
            lastSeenPrivacy: true,
            onlinePrivacy: true,
            profileName: true,
            profileStatus: true,
            readReceiptsPrivacy: true,
            statusPrivacy: true,
          },
        },
      },
    });

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não foi encontrado`,
        type: "error",
      });
    }

    const { ConnectionConfig, ...rest } = connection;

    return {
      message: "OK!",
      status: 200,
      connectionWA: {
        ...rest,
        ...ConnectionConfig,
      },
    };
  }
}
