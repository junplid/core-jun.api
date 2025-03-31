import { CreateSupervisorRepository_I } from "./Repository";
import { CreateSupervisorDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateSupervisorUseCase {
  constructor(private repository: CreateSupervisorRepository_I) {}

  async run(dto: CreateSupervisorDTO_I) {
    const exist = await prisma.supervisors.findFirst({
      where: { accountId: dto.accountId, username: dto.username },
      select: { id: true },
    });

    if (exist?.id) {
      throw new ErrorResponse(400).input({
        path: "username",
        text: `Já existe supervisor com esse username`,
      });
    }

    const data = await this.repository.create(dto);

    return {
      message: "OK!",
      status: 201,
      supervisor: data,
    };
  }
}
