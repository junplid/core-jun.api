import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetSubAccountDTO_I } from "./DTO";

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

export class GetSubAccountUseCase {
  constructor() {}

  async run(dto: GetSubAccountDTO_I) {
    const userFind = await prisma.subAccount.findUnique({
      where: dto,
      select: {
        name: true,
        status: true,
        email: true,
        SubAccountPermissionsCreate: props,
        SubAccountPermissionsDelete: props,
        SubAccountPermissionsUpdate: props,
      },
    });

    if (!userFind) {
      throw new ErrorResponse(400).toast({
        title: `Subconta não foi encontrado!`,
        type: "error",
      });
    }

    const {
      SubAccountPermissionsCreate,
      SubAccountPermissionsDelete,
      SubAccountPermissionsUpdate,
      ...user
    } = userFind;

    return {
      message: "OK!",
      status: 200,
      user: {
        ...user,
        status: Number(user.status),
        permissions: {
          create: SubAccountPermissionsCreate,
          delete: SubAccountPermissionsDelete,
          update: SubAccountPermissionsUpdate,
        },
      },
    };
  }
}
