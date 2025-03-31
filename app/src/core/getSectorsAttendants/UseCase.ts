import { GetSectorsAttendantsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetSectorsAttendantsUseCase {
  constructor() {}

  async run(dto: GetSectorsAttendantsDTO_I) {
    const sectorsAttendants = await prisma.sectorsAttendants.findMany({
      where: dto,
      select: {
        id: true,
        name: true,
        createAt: true,
        status: true,
        Sectors: { select: { name: true } },
        Business: { select: { name: true } },
      },
    });

    return {
      message: "OK!",
      status: 200,
      sectorsAttendants: sectorsAttendants.map(
        ({ Business, Sectors, ...d }) => ({
          ...d,
          sectorName: Sectors?.name ?? "",
          business: Business.name,
        })
      ),
    };
  }
}
