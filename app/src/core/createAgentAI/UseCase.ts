import { CreateAgentAIDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import OpenAI from "openai";
import { resolve } from "path";
import { createReadStream } from "fs-extra";
import { AssistantTool } from "openai/resources/beta/assistants";

let path = "";
if (process.env.NODE_ENV === "production") {
  path = resolve(__dirname, `../static/storage`);
} else {
  path = resolve(__dirname, `../../../static/storage`);
}

export async function ensureFileByName(
  openai: OpenAI,
  fileName: string,
  absPath: string
): Promise<string> {
  for await (const file of openai.files.list({ purpose: "assistants" })) {
    if (file.filename === fileName) return file.id;
  }
  const { id } = await openai.files.create({
    file: createReadStream(resolve(absPath)),
    purpose: "assistants",
  });

  return id;
}

export class CreateAgentAIUseCase {
  constructor() {}

  async run({ accountId, ...dto }: CreateAgentAIDTO_I) {
    const isPremium = await prisma.account.findFirst({
      where: { id: accountId, isPremium: true },
    });
    if (!isPremium) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Agentes de IA ilimitados — exclusivos para usuários Premium.",
      });
    }

    let providerCredentialId: number | undefined = undefined;
    let apiKey: string | undefined = undefined;
    if (dto.providerCredentialId) {
      const credential = await prisma.providerCredential.findFirst({
        where: { id: dto.providerCredentialId, accountId },
        select: { id: true, apiKey: true },
      });

      if (!credential) {
        throw new ErrorResponse(400).input({
          path: "providerCredentialId",
          text: "Credencial de provedor não encontrada",
        });
      }
      providerCredentialId = credential.id;
      apiKey = credential.apiKey;
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
      apiKey = dto.apiKey;
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
    const client = new OpenAI({ apiKey });

    try {
      const { AgentAIOnBusiness, id, ...agent } = await prisma.agentAI.create({
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
              data: dto.businessIds.map((businessId) => ({ businessId })),
            },
          },
          knowledgeBase: dto.knowledgeBase,
          personality: dto.personality,
          temperature: dto.temperature || 1,
        },
        select: {
          id: true,
          createAt: true,
          AgentAIOnBusiness: {
            select: { Business: { select: { id: true, name: true } } },
          },
        },
      });

      if (dto.files?.length) {
        const filesIds = await Promise.all(
          dto.files.map(async (fileLocalId) => {
            const existFile = await prisma.storagePaths.findFirst({
              where: { id: fileLocalId, accountId },
              select: { id: true, fileName: true },
            });
            if (existFile?.id) {
              const fileId = await ensureFileByName(
                client,
                existFile.fileName,
                resolve(path, existFile.fileName)
              );
              await prisma.storagePathOnAgentAI.create({
                data: { agentAIId: id, storagePathId: existFile.id, fileId },
              });
              return fileId;
            }
            return undefined;
          })
        );
        const filterFiles = filesIds.filter((id) => id) as string[];
        const { id: vsId } = await client.vectorStores.create({
          name: `knowledge-base-${id}`,
          file_ids: filterFiles,
        });
        await prisma.agentAI.update({
          where: { id },
          data: { vectorStoreId: vsId },
        });
      }

      return {
        status: 201,
        agentAI: {
          id,
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
