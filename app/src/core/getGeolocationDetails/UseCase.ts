import { GetGeolocationDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetGeolocationDetailsUseCase {
  constructor() {}

  async run(dto: GetGeolocationDetailsDTO_I) {
    const geolocation = await prisma.geolocation.findFirst({
      where: dto,
      orderBy: { id: "desc" },
      select: {
        address: true,
        latitude: true,
        longitude: true,
        name: true,
        GeolocationOnBusiness: {
          select: { Business: { select: { id: true, name: true } } },
        },
      },
    });

    if (!geolocation) {
      throw new ErrorResponse(400).toast({
        title: `Geolocalização não foi encontrada`,
        type: "error",
      });
    }

    const { GeolocationOnBusiness, ...rest } = geolocation;

    return {
      message: "OK!",
      status: 200,
      geolocations: {
        ...rest,
        business: GeolocationOnBusiness.map((s) => s.Business),
      },
    };
  }
}
