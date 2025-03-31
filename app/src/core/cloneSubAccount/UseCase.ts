import { CloneSubAccountDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

const props = {
  select: {
    business: true,
    campaign: true,
    campaignAudience: true,
    campaignOndemand: true,
    campaignParameters: true,
    chatbot: true,
    checkpoint: true,
    connections: true,
    contactWAOnAccount: true,
    customizationLink: true,
    dataFlow: true,
    emailService: true,
    flows: true,
    integration: true,
    sector: true,
    sectorAttendants: true,
    servicesConfig: true,
    supervisors: true,
    tags: true,
    uploadFile: true,
    users: true,
    variables: true,
  },
};

export class CloneSubAccountUseCase {
  constructor() {}

  async run(dto: CloneSubAccountDTO_I) {
    const subaccount = await prisma.subAccount.findUnique({
      where: { id: dto.id },
      select: {
        name: true,
        password: true,
        email: true,
        status: true,
        SubAccountPermissionsCreate: props,
        SubAccountPermissionsDelete: props,
        SubAccountPermissionsUpdate: props,
      },
    });

    if (!subaccount) {
      throw new ErrorResponse(400).toast({
        title: "Subconta não encontrada",
        type: "error",
      });
    }

    const {
      SubAccountPermissionsCreate,
      SubAccountPermissionsDelete,
      SubAccountPermissionsUpdate,
      ...rest
    } = subaccount;

    const clonedSubAccount = await prisma.subAccount.create({
      data: {
        ...rest,
        email: `COPIA_${new Date().getTime()}_${rest.email}`,
        name: `COPIA_${new Date().getTime()}_${rest.name}`,
        accountId: dto.accountId,
        ...(SubAccountPermissionsCreate && {
          SubAccountPermissionsCreate: { create: SubAccountPermissionsCreate },
        }),
        ...(SubAccountPermissionsDelete && {
          SubAccountPermissionsDelete: { create: SubAccountPermissionsDelete },
        }),
        ...(SubAccountPermissionsUpdate && {
          SubAccountPermissionsUpdate: { create: SubAccountPermissionsUpdate },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createAt: true,
      },
    });

    return {
      message: "Subconta clonada com sucesso!",
      status: 200,
      user: clonedSubAccount,
    };
  }
}
