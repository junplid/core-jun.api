import { DeleteAgentAIDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteAgentAIUseCase {
  constructor() {}

  async run(dto: DeleteAgentAIDTO_I) {
    const exist = await prisma.agentAI.count({ where: dto });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Agente AI não encontrado`,
        type: "error",
      });
    }

    await prisma.agentAI.delete({ where: dto });

    return { message: "OK!", status: 200 };
  }
}
