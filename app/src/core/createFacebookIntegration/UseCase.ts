import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateFacebookIntegrationDTO_I } from "./DTO";

export class CreateFacebookIntegrationUseCase {
  constructor() {}

  async run({ businessIds, ...dto }: CreateFacebookIntegrationDTO_I) {
    const findIntegration = await prisma.facebookIntegration.findFirst({
      where: {
        name: dto.name,
        FacebookIntegrationOnBusiness: {
          some: { businessId: { in: businessIds } },
        },
      },
    });

    if (!!findIntegration) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Integração facebook com o mesmo nome existente",
      });
    }

    try {
      const { FacebookIntegrationOnBusiness, ...faceIntegration } =
        await prisma.facebookIntegration.create({
          data: {
            ...dto,
            FacebookIntegrationOnBusiness: {
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          },
          select: {
            id: true,
            FacebookIntegrationOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
          },
        });

      return {
        message: "OK!",
        status: 200,
        fbIntegration: {
          ...faceIntegration,
          business: FacebookIntegrationOnBusiness.map(
            (s) => s.Business.name
          ).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Error, não foi possivel criar Integração facebook",
        type: "error",
      });
    }
  }
}
