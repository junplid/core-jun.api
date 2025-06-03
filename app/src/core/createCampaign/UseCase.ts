import { resolve } from "path";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCampaignDTO_I } from "./DTO";
import { ulid } from "ulid";
import { ensureDir, writeFile } from "fs-extra";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { socketIo } from "../../infra/express";
import { startCampaign } from "../../bin/startCampaign";

export class CreateCampaignUseCase {
  constructor() {}

  async run({ accountId, ...dto }: CreateCampaignDTO_I) {
    const existName = await prisma.campaign.findFirst({
      where: {
        accountId,
        name: dto.name,
        CampaignOnBusiness: { some: { businessId: { in: dto.businessIds } } },
      },
      select: { id: true },
    });
    if (existName) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe Campanha com esse nome",
      });
    }

    for await (const id of dto.connectionIds) {
      const isValid = await prisma.connectionWA.findFirst({
        where: {
          id,
          number: { not: null },
          Business: { accountId },
          NOT: {
            ConnectionOnCampaign: {
              some: {
                Campaign: {
                  status: {
                    in: ["running", "paused", "processing", "stopped"],
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      });
      if (isValid && cacheConnectionsWAOnline.get(id)) continue;
      throw new ErrorResponse(400).input({
        path: "connectionIds",
        text:
          dto.connectionIds.length > 1
            ? "Algumas Conexões WA estão invalidas ou desativadas."
            : "Conexão WA inválida ou desativada.",
      });
    }

    const findShootingSpeed = await prisma.shootingSpeed.findFirst({
      where: { id: dto.shootingSpeedId, status: true },
      select: { id: true },
    });

    if (!findShootingSpeed) {
      throw new ErrorResponse(400).input({
        path: "shootingSpeedId",
        text: "Velocidade de Disparo inválido ou não encontrado.",
      });
    }

    const flowExist = await ModelFlows.exists({
      accountId,
      _id: dto.flowId,
    });

    if (!flowExist) {
      throw new ErrorResponse(400).input({
        path: "flowId",
        text: "Fluxo de conversa não encontrado.",
      });
    }

    for await (const id of dto.tagsIds || []) {
      const isValid = await prisma.tag.findFirst({
        where: {
          id,
          accountId,
          ...(dto.businessIds?.length && {
            OR: [
              {
                TagOnBusiness: {
                  some: { businessId: { in: dto.businessIds } },
                },
              },
              { TagOnBusiness: { none: {} } },
            ],
          }),
        },
        select: { id: true },
      });
      if (isValid) continue;
      throw new ErrorResponse(400).input({
        path: "tagsIds",
        text:
          dto.connectionIds.length > 1
            ? "Algumas Tags não foram encontradas."
            : "Tag não encontrada.",
      });
    }
    const { id, name, status, createAt, CampaignOnBusiness } =
      await prisma.campaign.create({
        data: {
          accountId,
          flowId: dto.flowId,
          name: dto.name,
          description: dto.description,
          shootingSpeedId: findShootingSpeed.id,
          timeItWillStart: dto.timeItWillStart,
          ...(dto.businessIds?.length && {
            CampaignOnBusiness: {
              createMany: {
                data: dto.businessIds?.map((businessId) => ({ businessId })),
              },
            },
          }),
          ConnectionOnCampaign: {
            createMany: {
              data: dto.connectionIds.map((connectionWAId) => ({
                connectionWAId,
              })),
            },
          },
          ...(dto.tagsIds?.length && {
            HasTag_Campaign: {
              createMany: { data: dto.tagsIds.map((tagId) => ({ tagId })) },
            },
          }),
        },
        select: {
          id: true,
          name: true,
          status: true,
          createAt: true,
          CampaignOnBusiness: {
            select: { Business: { select: { name: true, id: true } } },
          },
        },
      });

    const contacts = await prisma.contactsWAOnAccount.findMany({
      where: {
        accountId,
        ...(dto.tagsIds?.length && {
          TagOnContactsWAOnAccount: { some: { tagId: { in: dto.tagsIds } } },
        }),
      },
      select: { id: true },
    });

    const audience = await prisma.audience.create({
      data: {
        name: `Campanha - ${name}/${ulid()}`,
        accountId,
        ...(dto.businessIds?.length && {
          AudienceOnBusiness: {
            createMany: {
              data: dto.businessIds.map((businessId) => ({ businessId })),
            },
          },
        }),
        ContactsWAOnAudience: {
          createMany: {
            data: contacts.map(({ id: cId }) => ({
              contactWAOnAccountId: cId,
            })),
          },
        },
        type: "static",
        AudienceOnCampaign: { create: { Campaign: { connect: { id } } } },
      },
      select: { id: true },
    });
    await prisma.flowState.createMany({
      data: contacts.map((c) => ({
        audienceId: audience.id,
        campaignId: id,
        flowId: dto.flowId,
        indexNode: "0",
        contactsWAOnAccountId: c.id,
      })),
      skipDuplicates: true,
    });

    try {
      let path = "";
      if (process.env.NODE_ENV === "production") {
        path = resolve(__dirname, `./bin/instructions/${accountId}/campaigns`);
      } else {
        path = resolve(
          __dirname,
          `../../bin/instructions/${accountId}/campaigns`
        );
      }

      const createInstruction = () => {
        (async () => {
          await new Promise((r) =>
            setTimeout(
              r,
              Math.random() * (3 * 60 * 1000 - 40 * 1000) + 40 * 1000
            )
          );
          await prisma.campaign.update({
            where: { id },
            data: { status: "running" },
          });
          cacheAccountSocket.get(accountId)?.listSocket?.forEach((sockId) =>
            socketIo.to(sockId).emit(`status-campaign`, {
              id,
              status: "running",
            })
          );
          startCampaign({ id, connectionIds: dto.connectionIds });
        })();
      };

      await ensureDir(path);
      await writeFile(
        `${path}/camp_${id}.json`,
        JSON.stringify({
          accountId,
          id,
          connectionIds: dto.connectionIds,
        })
      );
      createInstruction();
    } catch (error) {
      throw new ErrorResponse(400).container(
        "Error interno ao criar campanha. Nossa equipe já foi notificada!"
      );
    }

    return {
      message: "OK.",
      status: 201,
      campaign: {
        id,
        status,
        createAt,
        businesses: CampaignOnBusiness.map((s) => s.Business),
        totalFlows: contacts.length,
      },
    };
  }
}
