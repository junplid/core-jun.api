import { prisma } from "../../adapters/Prisma/client";
import { GetShootingSpeedDTO_I } from "./DTO";

export class GetShootingSpeedUseCase {
  constructor() {}

  async run({ id }: GetShootingSpeedDTO_I) {
    const shootingSpeed = await prisma.shootingSpeed.findFirst({
      where: { id },
      select: {
        status: true,
        name: true,
        sequence: true,
        numberShots: true,
        timeBetweenShots: true,
        timeRest: true,
      },
    });

    return { message: "OK.", status: 200, shootingSpeed };
  }
}
