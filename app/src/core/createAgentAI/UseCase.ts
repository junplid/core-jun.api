import { CreateAgentAIDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import OpenAI from "openai";

export class CreateAgentAIUseCase {
  constructor() {}

  async run({ accountId, ...dto }: CreateAgentAIDTO_I) {
    let providerCredentialId: number | undefined = undefined;
    if (dto.providerCredentialId) {
      const credential = await prisma.providerCredential.findFirst({
        where: { id: dto.providerCredentialId, accountId },
        select: { id: true },
      });

      if (!credential) {
        throw new ErrorResponse(400).input({
          path: "providerCredentialId",
          text: "Credencial de provedor não encontrada",
        });
      }
      providerCredentialId = credential.id;
    } else {
      if (!dto.apiKey) {
        throw new ErrorResponse(400).input({
          path: "apiKey",
          text: "Campo obrigatório",
        });
      }
      if (!dto.nameProvider) {
        throw new ErrorResponse(400).input({
          path: "nameProvider",
          text: "Campo obrigatório",
        });
      }

      const existingCredential = await prisma.providerCredential.findFirst({
        where: {
          accountId,
          label: dto.nameProvider,
          provider: "openai",
          apiKey: dto.apiKey,
        },
        select: { id: true, label: true },
      });

      if (existingCredential) {
        throw new ErrorResponse(400).input({
          path: "apiKey",
          text: `Esse provedor já existe. Selecione: ${existingCredential.label} na lista de provedores`,
        });
      }

      try {
        const client = new OpenAI({ apiKey: dto.apiKey });
        await client.models.list();
      } catch (error) {
        throw new ErrorResponse(400).input({
          path: "apiKey",
          text: "Credencial de API inválida",
        });
      }

      const newProviderCredential = await prisma.providerCredential.create({
        data: {
          accountId,
          apiKey: dto.apiKey,
          label: dto.nameProvider,
          provider: "openai",
        },
        select: { id: true },
      });
      providerCredentialId = newProviderCredential.id;
    }

    const exist = await prisma.agentAI.findFirst({
      where: { accountId, name: dto.name, providerCredentialId },
      select: { id: true },
    });

    if (exist) {
      await prisma.providerCredential.delete({
        where: { id: providerCredentialId },
      });
      throw new ErrorResponse(400)
        .input({
          path: "name",
          text: "Já existe um agente IA com esse nome e provedor",
        })
        .input({
          path: "providerCredentialId",
          text: `Já existe um agente IA com esse provedor e nome: "${dto.name}"`,
        });
    }

    try {
      const { AgentAIOnBusiness, ...agent } = await prisma.agentAI.create({
        data: {
          accountId,
          providerCredentialId,
          name: dto.name,
          emojiLevel: dto.emojiLevel || "none",
          model: dto.model,
          instructions: dto.instructions,
          debounce: dto.debounce,
          timeout: dto.timeout,
          AgentAIOnBusiness: {
            createMany: {
              data: dto.businessIds.map((businessId) => ({
                businessId,
              })),
            },
          },
          knowledgeBase: dto.knowledgeBase,
          personality: dto.personality,
          temperature: dto.temperature || 0.2,
          StoragePathsOnAgentAI: {
            createMany: {
              data:
                dto.files?.map((fileId) => ({ storagePathId: fileId })) || [],
            },
          },
        },
        select: {
          id: true,
          createAt: true,
          AgentAIOnBusiness: {
            select: { Business: { select: { id: true, name: true } } },
          },
        },
      });

      return {
        status: 201,
        agentAI: {
          ...agent,
          businesses: AgentAIOnBusiness.map((item) => item.Business),
        },
      };
    } catch (error) {
      console.error("Erro ao criar agente IA:", error);
      throw new ErrorResponse(500).container("Erro ao criar agente IA");
    }
  }
}
