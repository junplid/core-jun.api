import { GetInboxUserDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetInboxUserUseCase {
  constructor() {}

  async run(dto: GetInboxUserDTO_I) {
    const data = await prisma.inboxUsers.findFirst({
      where: dto,
      select: {
        name: true,
        email: true,
        inboxDepartmentId: true,
      },
    });

    if (!data) {
      throw new ErrorResponse(400).container("Usuário não encontrado.");
    }

    return { message: "OK!", status: 200, inboxUser: data };
  }
}
