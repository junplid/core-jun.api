import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateGeolocationDTO_I } from "./DTO";

export class UpdateGeolocationUseCase {
  constructor() {}

  async run({ accountId, id, businessIds, ...dto }: UpdateGeolocationDTO_I) {
    const exist = await prisma.geolocation.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Geolocalização não foi encontrada`,
        type: "error",
      });
    }

    try {
      const { GeolocationOnBusiness } = await prisma.geolocation.update({
        where: { id },
        data: {
          ...dto,
          ...(businessIds?.length && {
            GeolocationOnBusiness: {
              deleteMany: { geolocationId: id },
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          }),
        },
        select: {
          GeolocationOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
        },
      });

      return {
        message: "OK!",
        status: 200,
        geolocation: {
          business: GeolocationOnBusiness.map((s) => s.Business.name).join(
            ", "
          ),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar tag Geolocalização`,
        type: "error",
      });
    }
  }
}
