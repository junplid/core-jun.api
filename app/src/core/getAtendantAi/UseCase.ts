import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetAttendantAiDTO_I } from "./DTO";

export class GetAttendantAiUseCase {
  constructor() {}

  async run(dto: GetAttendantAiDTO_I) {
    try {
      const findAttendantAI = await prisma.attendantOnAI.findUnique({
        where: dto,
        include: {
          AttendantOnAIOnBusiness: {
            select: { businessId: true },
          },
          FilesOnAttendantOnAI: {
            select: { originalname: true, id: true },
          },
        },
      });

      if (!findAttendantAI) {
        throw new ErrorResponse(400).toast({
          title: `Atendente ia não encontrado!`,
          type: "error",
        });
      }

      const {
        accountId,
        createAt,
        updateAt,
        AttendantOnAIOnBusiness,
        id,
        role,
        definitions,
        FilesOnAttendantOnAI,
        ...attendantAI
      } = findAttendantAI;

      return {
        message: "OK!",
        status: 200,
        attendantAI: {
          ...attendantAI,
          businessIds: AttendantOnAIOnBusiness.map((s) => s.businessId),
          files: FilesOnAttendantOnAI,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ai tentar buscar atendente ia ou você não esta autorizado!`,
        type: "error",
      });
    }
  }
}
