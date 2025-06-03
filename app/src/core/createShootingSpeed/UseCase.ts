import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateShootingSpeedDTO_I } from "./DTO";

export class CreateShootingSpeedUseCase {
  constructor() {}

  async run({ rootId, ...dto }: CreateShootingSpeedDTO_I) {
    const exist = await prisma.shootingSpeed.findFirst({
      where: {
        OR: [{ name: dto.name }, { sequence: dto.sequence }],
      },
    });

    if (exist) {
      throw new ErrorResponse(400).container(
        `Já existe um com esse nome ou sequência.`
      );
    }

    const shootingSpeed = await prisma.shootingSpeed.create({ data: dto });

    return { message: "OK.", status: 201, shootingSpeed };
  }
}
