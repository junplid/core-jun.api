import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetEmailServiceConfigurationDTO_I } from "./DTO";

export class GetEmailServiceConfigurationUseCase {
  constructor() {}

  async run(dto: GetEmailServiceConfigurationDTO_I) {
    const emailServices = await prisma.emailServiceConfiguration.findFirst({
      where: dto,
      include: {
        EmailServiceConfigurationOnBusiness: {
          select: { Business: { select: { id: true } } },
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
      createAt,
      updateAt,
      interrupted,
      ...email
    } = emailServices;

    return {
      message: "OK!",
      status: 200,
      email: {
        ...email,
        businessIds: EmailServiceConfigurationOnBusiness.map(
          (s) => s.Business.id
        ),
      },
    };
  }
}
