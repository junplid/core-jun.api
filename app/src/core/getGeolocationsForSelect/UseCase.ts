import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetGeolocationForSelectDTO_I } from "./DTO";

export class GetGeolocationForSelectUseCase {
  constructor() {}

  async run(dto: GetGeolocationForSelectDTO_I) {
    try {
      const geolocations = await prisma.geolocation.findMany({
        where: {
          ...(dto.businessIds?.length && {
            GeolocationOnBusiness: {
              some: { businessId: { in: dto.businessIds } },
            },
          }),
          accountId: dto.accountId,
          name: dto.name,
        },
        select: {
          name: true,
          id: true,
        },
      });

      return { message: "OK!", status: 200, geolocations };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar buscar os Geolocalizações`,
        type: "error",
      });
    }
  }
}
