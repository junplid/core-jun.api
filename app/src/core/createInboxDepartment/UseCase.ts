import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateInboxDepartmentDTO_I } from "./DTO";

export class CreateInboxDepartmentUseCase {
  constructor() {}

  async run({ inboxUserIds, ...dto }: CreateInboxDepartmentDTO_I) {
    const countResource = await prisma.inboxDepartments.count({
      where: { accountId: dto.accountId },
    });

    if (countResource >= 1) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Limite de departamentos atingido.",
      });
    }

    const exist = await prisma.inboxDepartments.findFirst({
      where: {
        accountId: dto.accountId,
        name: dto.name,
        businessId: dto.businessId,
      },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        text: `Já existe um departamento com esse nome para esse projeto.`,
        path: "businessId",
      });
    }

    if (inboxUserIds?.length) {
      for await (const inboxUser of inboxUserIds) {
        const user = await prisma.inboxUsers.findFirst({
          where: { id: inboxUser, accountId: dto.accountId },
          select: { id: true },
        });

        if (!user) {
          throw new ErrorResponse(400).input({
            path: "inboxUserIds",
            text: `Usuário com ID:${inboxUser} não encontrado.`,
          });
        }
      }
    }

    try {
      const { Business, ...rest } = await prisma.inboxDepartments.create({
        data: {
          ...dto,
          InboxUsers: { connect: inboxUserIds?.map((id) => ({ id })) },
        },
        select: {
          id: true,
          createAt: true,
          Business: { select: { id: true, name: true } },
        },
      });

      return {
        message: "OK.",
        status: 201,
        inboxDepartment: {
          tickets_open: 0,
          tickets_new: 0,
          ...rest,
          business: Business,
        },
      };
    } catch (error) {
      console.error("Error creating inbox department:", error);
      throw new ErrorResponse(500).container("Erro ao criar departamento.");
    }
  }
}
