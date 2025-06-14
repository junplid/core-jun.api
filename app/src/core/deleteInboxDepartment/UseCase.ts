import { DeleteInboxDepartmentDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteInboxDepartmentUseCase {
  constructor() {}

  async run(dto: DeleteInboxDepartmentDTO_I) {
    const exist = await prisma.inboxDepartments.findFirst({
      where: dto,
      select: { id: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Departamento não encontrado`,
        type: "error",
      });
    }

    await prisma.inboxDepartments.delete({ where: dto });
    return { message: "OK!", status: 200 };
  }
}
