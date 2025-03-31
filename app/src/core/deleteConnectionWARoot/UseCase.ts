import { prisma } from "../../adapters/Prisma/client";
import { DeleteConnectionWARootDTO_I } from "./DTO";

export class DeleteConnectionWARootUseCase {
  constructor() {}

  async run(dto: DeleteConnectionWARootDTO_I) {
    await prisma.rootConnectionWA.delete({ where: { id: dto.id } });
    return { message: "OK!", status: 200 };
  }
}
