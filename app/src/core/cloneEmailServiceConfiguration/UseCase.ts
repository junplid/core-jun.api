import { CloneEmailServiceConfigurationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CloneEmailServiceConfigurationUseCase {
  constructor() {}

  async run(dto: CloneEmailServiceConfigurationDTO_I) {
    const emaill = await prisma.emailServiceConfiguration.findUnique({
      where: { id: dto.id },
      select: {
        host: true,
        pass: true,
        port: true,
        secure: true,
        user: true,
        EmailServiceConfigurationOnBusiness: { select: { businessId: true } },
      },
    });

    if (!emaill) {
      throw new ErrorResponse(400).toast({
        title: "Serviço de e-mail não encontrado",
        type: "error",
      });
    }

    const {
      EmailServiceConfigurationOnBusiness: EmailServiceConfigurationOnBusiness1,
      ...rest
    } = emaill;
    const host = `COPIA_${new Date().getTime()}_${rest.host}`;

    const clonedTag = await prisma.emailServiceConfiguration.create({
      data: {
        ...rest,
        host,
        accountId: dto.accountId,
        EmailServiceConfigurationOnBusiness: {
          createMany: {
            data: EmailServiceConfigurationOnBusiness1.map(
              ({ businessId }) => ({ businessId })
            ),
          },
        },
      },
      select: {
        id: true,
        createAt: true,
        EmailServiceConfigurationOnBusiness: {
          select: {
            Business: { select: { name: true } },
          },
        },
      },
    });

    const { EmailServiceConfigurationOnBusiness, ...restNext } = clonedTag;

    return {
      message: "Serviço de e-mail clonado com sucesso!",
      status: 200,
      email: {
        ...restNext,
        port: emaill.port,
        user: emaill.user,
        host,
        business: EmailServiceConfigurationOnBusiness.map(
          (b) => b.Business.name
        ).join(", "),
      },
    };
  }
}
