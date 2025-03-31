import { CloneFacebookIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneFacebookIntegrationUseCase {
  constructor() {}

  async run(dto: CloneFacebookIntegrationDTO_I) {
    const fbIntegration = await prisma.facebookIntegration.findFirst({
      where: dto,
      select: {
        name: true,
        description: true,
        access_token: true,
        status: true,
        FacebookIntegrationOnBusiness: { select: { businessId: true } },
      },
    });

    if (!fbIntegration) {
      throw new ErrorResponse(400).toast({
        title: "Integração com facebook não encontrada",
        type: "error",
      });
    }

    const {
      FacebookIntegrationOnBusiness: FacebookIntegrationOnBusiness1,
      ...rest
    } = fbIntegration;
    const name = `COPIA_${new Date().getTime()}_${rest.name}`;

    const clonedFbIntegration = await prisma.facebookIntegration.create({
      data: {
        ...rest,
        accountId: dto.accountId,
        name,
        FacebookIntegrationOnBusiness: {
          createMany: {
            data: FacebookIntegrationOnBusiness1.map(({ businessId }) => ({
              businessId,
            })),
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

    const { FacebookIntegrationOnBusiness, ...restNext } = clonedFbIntegration;

    return {
      message: "Integração com facebook com sucesso!",
      status: 200,
      fbIntegration: {
        ...restNext,
        status: rest.status ? "Ativo" : "Inativo",
        name,
        business: FacebookIntegrationOnBusiness.map(
          (fb) => fb.Business.name
        ).join(", "),
      },
    };
  }
}
