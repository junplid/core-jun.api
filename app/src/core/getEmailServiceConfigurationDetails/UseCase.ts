import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetEmailServiceConfigurationDetailsDTO_I } from "./DTO";

export class GetEmailServiceConfigurationDetailsUseCase {
  constructor() {}

  async run(dto: GetEmailServiceConfigurationDetailsDTO_I) {
    const emailServices = await prisma.emailServiceConfiguration.findFirst({
      where: dto,
      include: {
        EmailServiceConfigurationOnBusiness: {
          select: { Business: { select: { name: true, id: true } } },
        },
      },
    });

    if (!emailServices) {
      throw new ErrorResponse(400).toast({
        title: `Serviço de e-mail não foi encontrado!`,
        type: "error",
      });
    }

    const {
      EmailServiceConfigurationOnBusiness,
      accountId,
      id,
      interrupted,
      ...email
    } = emailServices;

    return {
      message: "OK!",
      status: 200,
      email: {
        ...email,
        business: EmailServiceConfigurationOnBusiness.map((s) => s.Business),
      },
    };
  }
}
