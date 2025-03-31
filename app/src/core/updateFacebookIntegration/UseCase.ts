import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateFacebookIntegrationDTO_I } from "./DTO";

export class UpdateFacebookIntegrationUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    businessIds,
    ...dto
  }: UpdateFacebookIntegrationDTO_I) {
    const exist = await prisma.facebookIntegration.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Integração facebook não foi encontrada`,
        type: "error",
      });
    }

    try {
      const { FacebookIntegrationOnBusiness } =
        await prisma.facebookIntegration.update({
          where: { id },
          data: {
            ...dto,
            ...(businessIds?.length && {
              FacebookIntegrationOnBusiness: {
                deleteMany: { facebookIntegrationId: id },
                createMany: {
                  data: businessIds.map((businessId) => ({ businessId })),
                },
              },
            }),
          },
          select: {
            FacebookIntegrationOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
          },
        });

      return {
        message: "OK!",
        status: 200,
        fbIntegration: {
          business: FacebookIntegrationOnBusiness.map(
            (fb) => fb.Business.name
          ).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Integração Facebook`,
        type: "error",
      });
    }
  }
}
