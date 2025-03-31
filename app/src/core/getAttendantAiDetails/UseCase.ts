import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetAttendantAiDetailsDTO_I } from "./DTO";

export class GetAttendantAiDetailsUseCase {
  constructor() {}

  async run(dto: GetAttendantAiDetailsDTO_I) {
    try {
      const findIntegrationAI = await prisma.attendantOnAI.findUnique({
        where: dto,
        include: {
          AttendantOnAIOnBusiness: {
            select: { Business: { select: { name: true, id: true } } },
          },
          ArtificialIntelligence: {
            select: { name: true, id: true },
          },
          FilesOnAttendantOnAI: {
            select: { originalname: true, id: true, filename: true },
          },
        },
      });

      if (!findIntegrationAI) {
        throw new ErrorResponse(400).toast({
          title: `Atendente ia não encontrado ou você não esta autorizado!`,
          type: "error",
        });
      }

      const {
        accountId,
        id,
        aiId,
        AttendantOnAIOnBusiness,
        ArtificialIntelligence,
        FilesOnAttendantOnAI,
        ...attendantIA
      } = findIntegrationAI;

      return {
        message: "OK!",
        status: 200,
        attendantAI: {
          ...attendantIA,
          business: AttendantOnAIOnBusiness.map((s) => s.Business),
          ai: ArtificialIntelligence,
          files: FilesOnAttendantOnAI,
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ai tentar buscar atendentes ia ou você não esta autorizado!`,
        type: "error",
      });
    }
  }
}
