import { prisma } from "../../adapters/Prisma/client";
import { calculateDailyShots } from "../../utils/calculateDailyShots";
import { GetShootingSpeedsDTO_I } from "./DTO";

export class GetShootingSpeedsUseCase {
  constructor() {}

  async run({}: GetShootingSpeedsDTO_I) {
    const find = await prisma.shootingSpeed.findMany({
      orderBy: { sequence: "asc" },
      where: { status: true },
      select: {
        id: true,
        name: true,
        sequence: true,
        numberShots: true,
        timeBetweenShots: true,
        timeRest: true,
        status: true,
      },
    });

    const shootingSpeeds = find
      .map((item) => {
        return {
          id: item.id,
          name: item.name,
          sequence: item.sequence,
          status: item.status,
          shootingPerDay: calculateDailyShots({
            numberShots: item.numberShots,
            timeBetweenShots: item.timeBetweenShots,
            timeRest: item.timeRest,
          }),
        };
      })
      .sort((a, b) => a.sequence - b.sequence);

    return { message: "OK.", status: 200, shootingSpeeds };
  }
}
