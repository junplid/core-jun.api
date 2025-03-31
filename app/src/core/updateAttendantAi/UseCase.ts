import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateAttendantAiDTO_I } from "./DTO";

export class UpdateAttendantAiUseCase {
  constructor() {}

  async run({
    accountId,
    id,
    businessIds,
    files,
    ...dto
  }: UpdateAttendantAiDTO_I) {
    const exist = await prisma.attendantOnAI.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Atendente IA não foi encontrado`,
        type: "error",
      });
    }

    try {
      const { AttendantOnAIOnBusiness } = await prisma.attendantOnAI.update({
        where: { id },
        data: {
          ...dto,
          ...(businessIds?.length && {
            AttendantOnAIOnBusiness: {
              deleteMany: { attendantId: id },
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          }),
          ...(files?.length && {
            FilesOnAttendantOnAI: { createMany: { data: files } },
          }),
        },
        select: {
          AttendantOnAIOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
        },
      });

      return {
        message: "OK!",
        status: 200,
        attendantAI: {
          business: AttendantOnAIOnBusiness.map((s) => s.Business.name).join(
            ", "
          ),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar atendente IA`,
        type: "error",
      });
    }
  }
}
