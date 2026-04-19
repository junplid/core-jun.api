import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateTableDTO_I } from "./DTO";

export class UpdateTableUseCase {
  constructor() {}

  async run({ accountId, id, ...rest }: UpdateTableDTO_I) {
    const exist = await prisma.table.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: "Mesa não encontrada!",
        description: "Ação não pode ser executada.",
      });
    }

    await prisma.table.update({
      where: { id },
      data: rest,
    });

    return { status: 201, message: "OK" };
  }
}
