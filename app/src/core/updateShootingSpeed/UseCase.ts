import { UpdateShootingSpeedDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class UpdateShootingSpeedUseCase {
  constructor() {}

  async run({ rootId, id, ...dto }: UpdateShootingSpeedDTO_I) {
    const exist = await prisma.shootingSpeed.findFirst({ where: { id } });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Velocidade de dísparo não encontrado."
      );
    }
    if (dto.name) {
      const existName = await prisma.shootingSpeed.findFirst({
        where: { id: { not: id }, name: dto.name, status: true },
        select: { id: true },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: "Já existe um `Velocidade de dísparos` esse nome.",
        });
      }
    }

    if (dto.sequence) {
      const existName = await prisma.shootingSpeed.findFirst({
        where: { id: { not: id }, sequence: dto.sequence, status: true },
        select: { id: true },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: "Já existe um `Velocidade de dísparos` nessa sequência.",
        });
      }
    }

    await prisma.shootingSpeed.update({
      where: { id },
      data: dto,
    });

    return { message: "OK!", status: 200 };
  }
}
