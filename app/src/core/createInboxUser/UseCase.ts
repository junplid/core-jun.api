import { genSalt, hash } from "bcrypt";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateInboxUsersDTO_I } from "./DTO";

export class CreateInboxUsersUseCase {
  constructor() {}

  async run({ password, ...dto }: CreateInboxUsersDTO_I) {
    const countResource = await prisma.inboxUsers.count({
      where: { accountId: dto.accountId },
    });

    if (countResource >= 0) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Limite de usuários atingido.",
      });
    }

    const exist = await prisma.inboxUsers.findFirst({
      where: { accountId: dto.accountId, email: dto.email },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        text: "Já existe um usuário com esse e-mail.",
        path: "email",
      });
    }

    if (dto.inboxDepartmentId) {
      const existD = await prisma.inboxDepartments.findFirst({
        where: { id: dto.inboxDepartmentId, accountId: dto.accountId },
        select: { id: true },
      });

      if (!existD) {
        throw new ErrorResponse(400).input({
          text: "Departamento não encontrado.",
          path: "inboxDepartmentId",
        });
      }
    }

    const salt = await genSalt(8);
    const passwordHash = await hash(password, salt);

    const { InboxDepartment, ...inboxUser } = await prisma.inboxUsers.create({
      data: { ...dto, password: passwordHash },
      select: {
        id: true,
        createAt: true,
        updateAt: true,
        InboxDepartment: { select: { id: true, name: true } },
      },
    });

    return {
      message: "OK.",
      status: 201,
      inboxUser: {
        ...inboxUser,
        department: InboxDepartment,
        tickets_open: 0,
        tickets_new: 0,
      },
    };
  }
}
