import { GetGeolocationsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class GetGeolocationsUseCase {
  constructor() {}

  async run(dto: GetGeolocationsDTO_I) {
    const geolocations = await prisma.geolocation.findMany({
      where: dto,
      orderBy: { id: "desc" },
      select: {
        address: true,
        name: true,
        id: true,
        GeolocationOnBusiness: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    return {
      message: "OK!",
      status: 200,
      geolocations: geolocations.map(({ GeolocationOnBusiness, ...rest }) => ({
        ...rest,
        business: GeolocationOnBusiness.map((s) => s.Business.name).join(", "),
      })),
    };
  }
}
