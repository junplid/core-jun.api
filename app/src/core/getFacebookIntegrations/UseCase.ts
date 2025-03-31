import { GetFacebookIntegrationsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetFacebookIntegrationsUseCase {
  constructor() {}

  async run(dto: GetFacebookIntegrationsDTO_I) {
    const fbIntegration = await prisma.facebookIntegration.findMany({
      where: { accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        id: true,
        status: true,
        name: true,
        FacebookIntegrationOnBusiness: {
          select: { Business: { select: { name: true } } },
        },
      },
    });

    if (!fbIntegration) {
      throw new ErrorResponse(400).toast({
        title: `Integração facebook não foi encontrada!`,
        type: "error",
      });
    }

    const fbIntegrations = fbIntegration.map((fb) => {
      const { FacebookIntegrationOnBusiness, ...rest } = fb;
      return {
        ...rest,
        business: FacebookIntegrationOnBusiness.map(
          (fb) => fb.Business.name
        ).join(", "),
        status: fb.status ? "Ativo" : "Inativo",
      };
    });

    return {
      message: "OK!",
      status: 200,
      fbIntegrations,
    };
  }
}
