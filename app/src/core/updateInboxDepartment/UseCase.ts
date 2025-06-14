import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateInboxDepartmentDTO_I } from "./DTO";

export class UpdateInboxDepartmentUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    businessId,
    inboxUserIds,
    ...dto
  }: UpdateInboxDepartmentDTO_I) {
    const exist = await prisma.inboxDepartments.findFirst({
      where: { accountId, id },
      select: { id: true, businessId: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Usuário não encontrao.`,
        type: "error",
      });
    }

    if (dto.name) {
      const existName = await prisma.inboxDepartments.findFirst({
        where: {
          accountId,
          id: { not: id },
          businessId: businessId || exist.businessId,
          name: dto.name,
        },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          text: `Já existe um departamento com o nome "${dto.name}" neste projeto.`,
          path: "name",
        });
      }
    }

    try {
      const { Business } = await prisma.inboxDepartments.update({
        where: { id },
        data: {
          ...dto,
          businessId,
          ...(inboxUserIds?.length && {
            InboxUsers: {
              deleteMany: {},
              connect: inboxUserIds.map((id) => ({ id })),
            },
          }),
        },
        select: {
          Business: { select: { id: true, name: true } },
          updateAt: true,
        },
      });

      return {
        message: "OK!",
        status: 200,
        inboxDepartment: { business: Business },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar departamento!`,
        type: "error",
      });
    }
  }
}
