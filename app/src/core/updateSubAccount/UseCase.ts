import { UpdateSubAccountDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { genSalt, hash } from "bcrypt";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateSubAccountUseCase {
  async run({ permissions, id, accountId, ...dto }: UpdateSubAccountDTO_I) {
    try {
      const exists = await prisma.subAccount.findUnique({
        where: { id, accountId },
        select: {
          id: true,
          SubAccountPermissionsCreate: { select: { id: true } },
          SubAccountPermissionsDelete: { select: { id: true } },
          SubAccountPermissionsUpdate: { select: { id: true } },
        },
      });

      if (!exists) {
        throw new ErrorResponse(400).toast({
          title: `Subconta não encontrada!`,
          type: "error",
        });
      }

      let password: string | undefined = undefined;
      if (dto.password) {
        const salt = await genSalt(6);
        password = await hash(dto.password, salt);
      }

      await prisma.subAccount.update({
        where: { id, accountId },
        data: {
          ...dto,
          ...(dto.password !== undefined && { password }),
        },
      });

      if (permissions?.create) {
        await prisma.subAccountPermissionsCreate.upsert({
          where: { id: exists.SubAccountPermissionsCreate?.id || 0 },
          create: { subAccountId: id, ...permissions.create },
          update: permissions.create,
        });
      }
      if (permissions?.update) {
        await prisma.subAccountPermissionsUpdate.upsert({
          where: { id: exists.SubAccountPermissionsUpdate?.id || 0 },
          create: { subAccountId: id, ...permissions.create },
          update: permissions.update,
        });
      }
      if (permissions?.delete) {
        await prisma.subAccountPermissionsDelete.upsert({
          where: { id: exists.SubAccountPermissionsDelete?.id || 0 },
          create: { subAccountId: id, ...permissions.delete },
          update: permissions.delete,
        });
      }

      return { message: "Subconta atualizada com sucesso!", status: 200 };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar subconta!`,
        type: "error",
      });
    }
  }
}
