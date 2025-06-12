import OpenAI from "openai";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateAgentAIDTO_I } from "./DTO";
import deepEqual from "fast-deep-equal";
import { resolve } from "path";
import { createReadStream } from "fs-extra";

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

export class UpdateAgentAIUseCase {
  constructor() {}

  async run({ accountId, id, businessIds, ...dto }: UpdateAgentAIDTO_I) {
    const agent = await prisma.agentAI.findFirst({
      where: { accountId, id },
      select: {
        id: true,
        vectorStoreId: true,
        StoragePathsOnAgentAI: {
          select: {
            fileId: true,
            storagePathId: true,
            id: true,
            StoragePaths: { select: { fileName: true } },
          },
        },
        ProviderCredential: { select: { apiKey: true } },
      },
    });

    if (!agent) {
      throw new ErrorResponse(400).toast({
        title: `Agente AI não encontrado!`,
        type: "error",
      });
    }

    if (dto.apiKey) {
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
      dto.providerCredentialId = newProviderCredential.id;
    }

    try {
      const { files, apiKey, nameProvider, ...rest } = dto;
      const { AgentAIOnBusiness } = await prisma.agentAI.update({
        where: { id },
        data: {
          ...rest,
          ...(businessIds?.length && {
            AgentAIOnBusiness: {
              deleteMany: { agentId: id },
              createMany: {
                data: businessIds.map((businessId) => ({ businessId })),
              },
            },
          }),
          // ...(!businessIds?.length && { AgentAIOnBusiness: { deleteMany: {} } }),
        },
        select: {
          AgentAIOnBusiness: {
            select: { Business: { select: { name: true, id: true } } },
          },
        },
      });

      if (files?.length) {
        let agentVectorStoreId = agent.vectorStoreId;
        const openai = new OpenAI({
          apiKey: agent.ProviderCredential.apiKey,
        });
        if (!agentVectorStoreId) {
          const { id: vsId } = await openai.vectorStores.create({
            name: `knowledge-base-${id}`,
          });
          agentVectorStoreId = vsId;
          await prisma.agentAI.update({
            where: { id },
            data: { vectorStoreId: agentVectorStoreId },
          });
        }
        const nextFiles = await prisma.storagePaths.findMany({
          where: { id: { in: files }, accountId },
          select: { id: true, fileName: true },
        });
        const filesInAgent = agent.StoragePathsOnAgentAI.map((f) => ({
          id: f.storagePathId,
          fileName: f.StoragePaths.fileName,
          fileId: f.fileId,
        }));
        const isEqual = deepEqual(filesInAgent, files);

        if (!isEqual) {
          const newFileIds = nextFiles.filter(
            (f) => !filesInAgent.some((e) => e.id === f.id)
          );
          const removedFileIds = filesInAgent.filter(
            (fileAg) => !dto.files?.some((f) => f === fileAg.id)
          );
          if (newFileIds.length) {
            await Promise.all(
              newFileIds.map(async (f) => {
                const fId = await ensureFileByName(
                  openai,
                  f.fileName,
                  resolve(path, f.fileName)
                );
                await openai.vectorStores.files.createAndPoll(
                  agentVectorStoreId,
                  { file_id: fId }
                );
                await prisma.storagePathOnAgentAI.create({
                  data: {
                    agentAIId: id,
                    storagePathId: f.id,
                    fileId: fId,
                  },
                });
              })
            );
          }
          if (removedFileIds.length) {
            for await (const element of removedFileIds) {
              if (element.fileId && agent.vectorStoreId) {
                try {
                  await openai.vectorStores.files.delete(element.fileId, {
                    vector_store_id: agent.vectorStoreId,
                  });
                } catch (error: any) {
                  if (error.status === 404) {
                    console.log(
                      `File ${element.fileId} not found on OpenAI, but deleted from local storage.`
                    );
                  }
                }
                try {
                  await openai.files.delete(element.fileId);
                } catch (error: any) {
                  if (error.status === 404) {
                    console.log(
                      `File ${element.fileId} not found on OpenAI, but deleted from local storage.`
                    );
                  }
                }
                await prisma.storagePathOnAgentAI.delete({
                  where: { id: element.id },
                });
              }
            }
          }
        }
      } else {
        const openai = new OpenAI({
          apiKey: agent.ProviderCredential.apiKey,
        });
        if (agent.vectorStoreId) {
          const filesInAgent = agent.StoragePathsOnAgentAI.map((f) => ({
            id: f.id,
            fileId: f.fileId,
          }));
          if (filesInAgent.length) {
            for await (const file of filesInAgent) {
              if (file.fileId && agent.vectorStoreId) {
                try {
                  await openai.vectorStores.files.delete(file.fileId, {
                    vector_store_id: agent.vectorStoreId,
                  });
                  await openai.files.delete(file.fileId);
                } catch (error: any) {
                  if (error.status === 404) {
                    console.log(
                      `File ${file.fileId} not found on OpenAI, but deleted from local storage.`
                    );
                  }
                }
                await prisma.storagePathOnAgentAI.delete({
                  where: { id: file.id },
                });
              }
            }
            await openai.vectorStores.delete(agent.vectorStoreId);
          }
        }
        await prisma.agentAI.update({
          where: { id },
          data: { vectorStoreId: null },
        });
      }

      return {
        message: "OK!",
        status: 200,
        agentAI: { businesses: AgentAIOnBusiness.map((s) => s.Business) },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar agente AI!`,
        type: "error",
      });
    }
  }
}
