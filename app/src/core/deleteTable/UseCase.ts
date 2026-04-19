import { DeleteTableDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteTableUseCase {
  constructor() {}

  async run(dto: DeleteTableDTO_I) {
    const exist = await prisma.table.findFirst({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Mesa não encontrada.`,
        type: "error",
      });
    }

    await prisma.table.delete({ where: { id: dto.id } });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
