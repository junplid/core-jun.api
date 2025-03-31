import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateAttendantAiDTO_I } from "./DTO";

export class CreateAttendantAiUseCase {
  constructor() {}

  async run({ accountId, businessIds, files, ...dto }: CreateAttendantAiDTO_I) {
    const existAI = await prisma.artificialIntelligence.findFirst({
      where: { id: dto.aiId, accountId },
    });

    if (!existAI) {
      throw new ErrorResponse(400).toast({
        title: "Integração IA não encontrada",
        type: "error",
      });
    }

    const existName = await prisma.attendantOnAI.findFirst({
      where: { accountId, name: dto.name },
      select: { id: true },
    });

    if (existName?.id) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe um atendente com esse nome",
      });
    }

    const { AttendantOnAIOnBusiness, ...attendantAI } =
      await prisma.attendantOnAI.create({
        data: {
          ...dto,
          accountId,
          AttendantOnAIOnBusiness: {
            createMany: {
              data: businessIds.map((businessId) => ({ businessId })),
            },
          },
          ...(files?.length && {
            FilesOnAttendantOnAI: { createMany: { data: files } },
          }),
        },
        select: {
          id: true,
          createAt: true,
          AttendantOnAIOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
        },
      });

    return {
      message: "OK!",
      status: 201,
      attendantAI: {
        ...attendantAI,
        business: AttendantOnAIOnBusiness.map((s) => s.Business.name).join(
          ", "
        ),
      },
    };
  }
}
