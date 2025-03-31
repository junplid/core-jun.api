import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateGeolocationBusinessDTO_I } from "./DTO";

export class CreateGeolocationBusinessUseCase {
  constructor() {}

  async run({
    accountId,
    businessIds,
    ...dto
  }: CreateGeolocationBusinessDTO_I) {
    const exist = await prisma.geolocation.findFirst({
      where: {
        name: dto.name,
        accountId,
        GeolocationOnBusiness: { some: { businessId: { in: businessIds } } },
      },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Geolocalização já existente",
      });
    }

    const { GeolocationOnBusiness, ...geolocation } =
      await prisma.geolocation.create({
        data: {
          ...dto,
          accountId,
          GeolocationOnBusiness: {
            createMany: {
              data: businessIds.map((businessId) => ({ businessId })),
            },
          },
        },
        select: {
          id: true,
          GeolocationOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
        },
      });

    return {
      message: "OK!",
      status: 201,
      geolocation: {
        ...geolocation,
        business: GeolocationOnBusiness.map((s) => s.Business.name).join(", "),
      },
    };
  }
}
