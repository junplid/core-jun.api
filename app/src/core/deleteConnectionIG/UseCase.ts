import { DeleteConnectionIGDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { decrypte } from "../../libs/encryption";
import {
  metaUnsubscribeApps,
  revokeUserPermissions,
} from "../../services/meta/meta.service";

export class DeleteConnectionIGUseCase {
  constructor() {}

  async run(dto: DeleteConnectionIGDTO_I) {
    const connection = await prisma.connectionIg.findFirst({
      where: {
        id: dto.id,
        Business: { accountId: dto.accountId },
      },
      select: { ig_username: true, credentials: true, page_id: true },
    });

    if (!connection) {
      throw new ErrorResponse(400).toast({
        title:
          "Conexão não encontrada ou você não tem permissão para apaga-la.",
        type: "error",
      });
    }

    try {
      const payload = decrypte(connection.credentials);
      await metaUnsubscribeApps({
        page_id: connection.page_id,
        account_access_token: payload.account_access_token,
      });
      await revokeUserPermissions({
        user_access_token: payload.account_access_token,
      });
    } catch (error) {
      await prisma.logSystem.create({
        data: {
          name: "error_delete_data_meta_account",
          description: JSON.stringify(error, null, 2),
        },
      });
      throw new ErrorResponse(400).toast({
        title:
          "Conexão não encontrada ou você não tem permissão para apaga-la.",
        type: "error",
      });
    }

    await prisma.connectionIg.delete({
      where: { id: dto.id, Business: { accountId: dto.accountId } },
    });

    return { message: "OK!", status: 200 };
  }
}
