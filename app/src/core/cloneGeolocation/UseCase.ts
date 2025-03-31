import { CloneGeolocationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneGeolocationUseCase {
  constructor() {}

  async run(dto: CloneGeolocationDTO_I) {
    const geoo = await prisma.geolocation.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        GeolocationOnBusiness: { select: { businessId: true } },
      },
    });

    if (!geoo) {
      throw new ErrorResponse(400).toast({
        title: "Geolocalização não encontrado",
        type: "error",
      });
    }

    const { GeolocationOnBusiness: GeolocationOnBusiness1, ...rest } = geoo;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedTag = await prisma.geolocation.create({
      data: {
        ...rest,
        name,
        accountId: dto.accountId,
        GeolocationOnBusiness: {
          createMany: {
            data: GeolocationOnBusiness1.map(({ businessId }) => ({
              businessId,
            })),
          },
        },
      },
      select: {
        id: true,
        GeolocationOnBusiness: {
          select: {
            Business: { select: { name: true } },
          },
        },
        address: true,
      },
    });

    const { GeolocationOnBusiness, ...restNext } = clonedTag;

    return {
      message: "Geolocalização clonada com sucesso!",
      status: 200,
      geolocation: {
        ...restNext,
        name,
        business: GeolocationOnBusiness.map((b) => b.Business.name).join(", "),
      },
    };
  }
}
