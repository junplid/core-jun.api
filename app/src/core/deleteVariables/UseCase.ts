import { DeleteVariableDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteVariableUseCase {
  constructor() {}

  async run(dto: DeleteVariableDTO_I) {
    const exist = await prisma.variable.count({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Variável não encontrada`,
        type: "error",
      });
    }

    await prisma.variable.delete({ where: dto });

    return { message: "OK!", status: 200 };
  }
}
