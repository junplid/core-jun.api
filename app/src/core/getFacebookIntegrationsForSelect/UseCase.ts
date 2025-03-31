import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetFacebookIntegrationsForSelectDTO_I } from "./DTO";

export class GetFacebookIntegrationsForSelectUseCase {
  constructor() {}

  async run(dto: GetFacebookIntegrationsForSelectDTO_I) {
    try {
      const facebookIntegration = await prisma.facebookIntegration.findMany({
        where: {
          accountId: dto.accountId,
          status: true,
          ...(dto.businessIds?.length && {
            FacebookIntegrationOnBusiness: {
              some: {
                businessId: {
                  in: dto.businessIds,
                },
              },
            },
          }),
        },
        select: { name: true, id: true },
      });

      return {
        message: "OK!",
        status: 200,
        fbIntegrations: facebookIntegration,
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao buscar integrações com facebook ou você não esta autorizado!`,
        type: "error",
      });
    }
  }
}
