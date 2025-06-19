import { DeleteShootingSpeeDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteShootingSpeeUseCase {
  constructor() {}

  async run(dto: DeleteShootingSpeeDTO_I) {
    const exist = await prisma.shootingSpeed.count({ where: { id: dto.id } });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Velocidade não encontrada`,
        type: "error",
      });
    }

    await prisma.shootingSpeed.delete({ where: { id: dto.id } });

    return { message: "OK!", status: 200 };
  }
}
