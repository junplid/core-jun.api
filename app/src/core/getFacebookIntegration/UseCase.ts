import { GetFacebookIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetFacebookIntegrationUseCase {
  constructor() {}

  async run(dto: GetFacebookIntegrationDTO_I) {
    const fbIntegration = await prisma.facebookIntegration.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      select: {
        status: true,
        name: true,
        description: true,
        access_token: true,
        FacebookIntegrationOnBusiness: {
          select: { Business: { select: { id: true } } },
        },
      },
    });

    if (!fbIntegration) {
      throw new ErrorResponse(400).toast({
        title: `Integração facebook não foi encontrada!`,
        type: "error",
      });
    }
    const { FacebookIntegrationOnBusiness, ...rest } = fbIntegration;

    return {
      message: "OK!",
      status: 200,
      fbIntegrations: {
        ...rest,
        businessIds: FacebookIntegrationOnBusiness.map((fb) => fb.Business.id),
      },
    };
  }
}
