import { DeleteAgentAIDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import OpenAI from "openai";
import { cacheInfoAgentAI } from "../../adapters/Baileys/Cache";

export class DeleteAgentAIUseCase {
  constructor() {}

  async run(dto: DeleteAgentAIDTO_I) {
    const exist = await prisma.agentAI.findFirst({
      where: dto,
      select: {
        vectorStoreId: true,
        ProviderCredential: { select: { apiKey: true } },
        StoragePathsOnAgentAI: { select: { fileId: true } },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Agente AI não encontrado`,
        type: "error",
      });
    }

    if (exist.StoragePathsOnAgentAI.length) {
      const openai = new OpenAI({ apiKey: exist.ProviderCredential.apiKey });
      if (exist.vectorStoreId) {
        await openai.vectorStores.delete(exist.vectorStoreId);
      }
      for await (const { fileId } of exist.StoragePathsOnAgentAI) {
        try {
          if (fileId) await openai.files.delete(fileId);
        } catch (error: any) {
          console.log("Error deleting vector store:", error.status);
        }
      }
    }

    await prisma.agentAI.delete({ where: dto });
    cacheInfoAgentAI.delete(dto.id);

    return { message: "OK!", status: 200 };
  }
}
