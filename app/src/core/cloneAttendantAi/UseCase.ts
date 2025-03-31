import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneAttendantAiDTO_I } from "./DTO";

export class CreateCloneAttendantAiUseCase {
  constructor() {}

  async run({ accountId, id: idOrigin }: CreateCloneAttendantAiDTO_I) {
    const exist = await prisma.attendantOnAI.findFirst({
      where: { id: idOrigin, accountId },
      include: { AttendantOnAIOnBusiness: { select: { businessId: true } } },
    });

    if (!exist?.id) {
      throw new ErrorResponse(400).toast({
        title: "Atendente IA não encontrada",
        type: "error",
      });
    }

    const { id, updateAt, createAt, AttendantOnAIOnBusiness, ...rest } = exist;

    const name = `COPIA_${new Date().getTime()}_${exist.name}`;

    try {
      const { AttendantOnAIOnBusiness: Businesses, ...integrationAI } =
        await prisma.attendantOnAI.create({
          data: {
            ...rest,
            name,
            AttendantOnAIOnBusiness: {
              createMany: { data: AttendantOnAIOnBusiness },
            },
          },
          select: {
            id: true,
            name: true,
            createAt: true,
            AttendantOnAIOnBusiness: {
              select: { Business: { select: { name: true } } },
            },
          },
        });
      return {
        message: "OK!",
        status: 200,
        attendantAI: {
          ...integrationAI,
          business: Businesses.map((s) => s.Business.name).join(", "),
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: "Erro ao tentar clonar atendente IA",
        type: "error",
      });
    }
  }
}
