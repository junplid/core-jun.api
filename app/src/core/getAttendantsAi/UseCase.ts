import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetAttendantsAiDTO_I } from "./DTO";

export class GetAttendantsAiUseCase {
  constructor() {}

  async run(dto: GetAttendantsAiDTO_I) {
    try {
      const findAttendantsAI = await prisma.attendantOnAI.findMany({
        where: dto,
        select: {
          name: true,
          AttendantOnAIOnBusiness: {
            select: { Business: { select: { name: true } } },
          },
          createAt: true,
          id: true,
        },
      });

      if (!findAttendantsAI) {
        throw new ErrorResponse(400).toast({
          title: `Atendente ia não encontrada!`,
          type: "error",
        });
      }

      const attendantsAI = findAttendantsAI.map(
        ({ AttendantOnAIOnBusiness, ...s }) => ({
          ...s,
          business: AttendantOnAIOnBusiness.map((dd) => dd.Business.name).join(
            ", "
          ),
        })
      );

      return { message: "OK!", status: 200, attendantsAI };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ai tentar buscar atendente ia ou você não esta autorizado!`,
        type: "error",
      });
    }
  }
}
