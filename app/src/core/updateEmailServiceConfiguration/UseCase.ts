import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateEmailServiceConfigurationDTO_I } from "./DTO";

export class UpdateEmailServiceConfigurationUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    businessIds,
    ...dto
  }: UpdateEmailServiceConfigurationDTO_I) {
    const exist = await prisma.emailServiceConfiguration.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Serviço de E-mail não foi encontrado`,
        type: "error",
      });
    }

    try {
      const { EmailServiceConfigurationOnBusiness } =
        await prisma.emailServiceConfiguration.update({
          where: { id },
          data: {
            ...dto,
            ...(businessIds?.length && {
              EmailServiceConfigurationOnBusiness: {
                deleteMany: { emailServiceConfigurationId: id },
                createMany: {
                  data: businessIds.map((businessId) => ({ businessId })),
                },
              },
            }),
          },
          select: {
            EmailServiceConfigurationOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
          },
        });

      return {
        message: "OK!",
        status: 200,
        email: {
          business: EmailServiceConfigurationOnBusiness.map(
            (s) => s.Business.name
          ).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar serviço de E-mail`,
        type: "error",
      });
    }
  }
}
