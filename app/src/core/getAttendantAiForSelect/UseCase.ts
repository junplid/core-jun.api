import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetAttendantAiForSelectDTO_I } from "./DTO";

export class GetAttendantAiForSelectUseCase {
  constructor() {}

  async run(dto: GetAttendantAiForSelectDTO_I) {
    try {
      const attendantsAI = await prisma.attendantOnAI.findMany({
        where: {
          ...(dto.businessIds?.length && {
            AttendantOnAIOnBusiness: {
              some: { businessId: { in: dto.businessIds } },
            },
          }),
          accountId: dto.accountId,
          name: dto.name,
        },
        select: { name: true, id: true },
      });

      return { message: "OK!", status: 200, attendantsAI };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ai tentar buscar atendentes ia ou você não esta autorizado!`,
        type: "error",
      });
    }
  }
}
