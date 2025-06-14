import { GetInboxDepartmentDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetInboxDepartmentUseCase {
  constructor() {}

  async run(dto: GetInboxDepartmentDTO_I) {
    const data = await prisma.inboxDepartments.findFirst({
      where: dto,
      select: {
        name: true,
        businessId: true,
        InboxUsers: { select: { id: true } },
        previewNumber: true,
        previewPhoto: true,
        signBusiness: true,
        signUser: true,
        signDepartment: true,
      },
    });

    if (!data) {
      throw new ErrorResponse(400).container("Usuário não encontrado.");
    }

    const { InboxUsers, ...inboxDepartment } = data;

    return {
      message: "OK!",
      status: 200,
      inboxDepartment: {
        ...inboxDepartment,
        inboxUserIds: InboxUsers.map(({ id }) => id),
      },
    };
  }
}
