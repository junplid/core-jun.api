import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCampaignDTO_I } from "./DTO";
import { ulid } from "ulid";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { socketIo } from "../../infra/express";
import { startCampaign } from "../../utils/startCampaign";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { mongo } from "../../adapters/mongo/connection";

export class CreateCampaignUseCase {
  constructor() {}

  async run({ accountId, contacts: contactsDTO, ...dto }: CreateCampaignDTO_I) {
    const listContactDTO: { id: number; name?: string }[] = [];
    if (contactsDTO?.length) {
      for await (const contact of contactsDTO) {
        const newNumber = validatePhoneNumber(contact.number);
        if (newNumber) {
          const { id } = await prisma.contactsWA.upsert({
            where: {
              completeNumber_page_id_channel: {
                completeNumber: newNumber,
                channel: "whatsapp",
                page_id: "whatsapp_default",
              },
            },
            create: { completeNumber: newNumber },
            update: {},
            select: { id: true },
          });
          listContactDTO.push({ id, name: contact.name });
        }
      }
    }

    // const isPremium = await prisma.account.findFirst({
    //   where: { id: accountId, isPremium: true },
    //   select: { id: true },
    // });

    // if (!isPremium) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Campanhas ilimitadas — exclusivos para usuários Premium.",
    //   });
    // }
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

    await mongo();
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

    const contacts: number[] = [];

    if (dto.tagsIds?.length) {
      const getcontacts = await prisma.contactsWAOnAccount.findMany({
        where: {
          accountId,
          ...(dto.tagsIds?.length && {
            TagOnContactsWAOnAccount: { some: { tagId: { in: dto.tagsIds } } },
          }),
        },
        select: { id: true },
      });
      contacts.push(...getcontacts.map((s) => s.id));
    }

    if (listContactDTO.length) {
      for await (const c of listContactDTO) {
        const exist = await prisma.contactsWAOnAccount.findFirst({
          where: { accountId, contactWAId: c.id },
          select: { id: true },
        });
        if (!exist) {
          const { id: cId } = await prisma.contactsWAOnAccount.create({
            data: { name: c.name || "<unknown>", accountId, contactWAId: c.id },
            select: { id: true },
          });
          contacts.push(cId);
        } else {
          contacts.push(exist.id);
        }
      }
    }

    const setContacts = Array.from(new Set(contacts));

    if (!setContacts.length) {
      throw new ErrorResponse(400).input({
        path: "tagsIds",
        text: "Filtre os contatos por etiquetas ou manualmente.",
      });
    }

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
            data: setContacts.map((cId) => ({ contactWAOnAccountId: cId })),
          },
        },
        type: "static",
        AudienceOnCampaign: { create: { Campaign: { connect: { id } } } },
      },
      select: { id: true },
    });

    await prisma.flowState.createMany({
      data: setContacts.map((c) => ({
        audienceId: audience.id,
        campaignId: id,
        flowId: dto.flowId,
        indexNode: "0",
        contactsWAOnAccountId: c,
      })),
      skipDuplicates: true,
    });

    try {
      const createInstruction = () => {
        (async () => {
          // await new Promise((r) =>
          //   setTimeout(
          //     r,
          //     Math.random() * (3 * 60 * 1000 - 40 * 1000) + 40 * 1000
          //   )
          // );
          await prisma.campaign.update({
            where: { id },
            data: { status: "running" },
          });
          cacheAccountSocket.get(accountId)?.listSocket?.forEach((sockId) =>
            socketIo.to(sockId.id).emit(`status-campaign`, {
              id,
              status: "running",
            }),
          );
          startCampaign({ id });
        })();
      };

      createInstruction();
    } catch (error) {
      throw new ErrorResponse(400).container(
        "Error interno ao criar campanha. Nossa equipe já foi notificada!",
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
