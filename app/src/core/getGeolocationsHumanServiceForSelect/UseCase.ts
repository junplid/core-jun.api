import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetGeolocationHumanServiceForSelectDTO_I } from "./DTO";

export class GetGeolocationHumanServiceForSelectUseCase {
  constructor() {}

  async run(dto: GetGeolocationHumanServiceForSelectDTO_I) {
    try {
      let businessIds: number[] = [];

      const attendant = await prisma.sectorsAttendants.findFirst({
        where: { id: dto.userId },
        select: { Sectors: { select: { businessId: true } } },
      });

      if (attendant && attendant.Sectors) {
        businessIds = [attendant.Sectors.businessId];
      } else {
        const supervisor = await prisma.supervisors.findFirst({
          where: { id: dto.userId },
          select: { Sectors: { select: { businessId: true } } },
        });
        if (supervisor && !!supervisor.Sectors.length) {
          businessIds = supervisor.Sectors.map((s) => s.businessId);
        }
      }

      if (!businessIds.length) {
        throw new ErrorResponse(400).toast({
          title: ` Não foi possivel buscar os negócios`,
          type: "error",
        });
      }

      const geolocations = await prisma.geolocation.findMany({
        where: {
          GeolocationOnBusiness: { some: { businessId: { in: businessIds } } },
          name: dto.name,
        },
        select: { name: true, id: true },
      });

      return { message: "OK!", status: 200, geolocations };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar buscar os negócios`,
        type: "error",
      });
    }
  }
}
