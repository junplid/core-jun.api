import { CreateChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import checkConflictOfOperatingDays from "../../helpers/checkConflictOfOperatingDays";

export class CreateChatbotUseCase {
  constructor() {}

  async run({ ...dto }: CreateChatbotDTO_I) {
    const countResource = await prisma.chatbot.count({
      where: { accountId: dto.accountId },
    });

    if (countResource > 1) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Limite de bot receptivo atingido.",
      });
    }

    const exist = await prisma.chatbot.findFirst({
      where: {
        name: dto.name,
        accountId: dto.accountId,
        businessId: dto.businessId,
      },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe um `Bot` com esse nome",
      });
    }

    if (dto.connectionWAId) {
      const pickConnection = await prisma.connectionWA.findFirst({
        where: {
          id: dto.connectionWAId,
          Business: { accountId: dto.accountId, id: dto.businessId },
        },
        select: {
          Chatbot: {
            select: {
              id: true,
              name: true,
              OperatingDays: {
                select: {
                  dayOfWeek: true,
                  WorkingTimes: { select: { start: true, end: true } },
                },
              },
            },
          },
        },
      });

      if (!pickConnection) {
        throw new ErrorResponse(400).input({
          path: "connectionWAId",
          text: "Conexão WA não encontrada",
        });
      }

      if (pickConnection.Chatbot.length) {
        for (const oldChatbot of pickConnection.Chatbot) {
          if (!dto.operatingDays?.length || !oldChatbot.OperatingDays.length) {
            throw new ErrorResponse(400).input({
              path: "connectionWAId",
              text: `O bot "${oldChatbot.name}", que opera 24 horas por dia, 7 dias por semana, já utiliza a conexão WA`,
            });
          }

          const conflicts = checkConflictOfOperatingDays(
            dto.operatingDays,
            oldChatbot.OperatingDays
          );

          if (conflicts.length) {
          }
        }
      }
    }

    const { operatingDays, timeToRestart, ...data } = dto;

    const { id, Business, createAt } = await prisma.chatbot.create({
      data: {
        ...data,
        ...(timeToRestart && { TimeToRestart: { create: timeToRestart } }),
      },
      select: {
        Business: { select: { name: true, id: true } },
        id: true,
        createAt: true,
      },
    });

    if (operatingDays?.length) {
      for await (const operationDay of operatingDays) {
        await prisma.operatingDays.create({
          data: {
            dayOfWeek: operationDay.dayOfWeek,
            ...(operationDay.workingTimes?.length && {
              WorkingTimes: { createMany: { data: operationDay.workingTimes } },
            }),
          },
        });
      }
    }
    let status = false;
    if (dto.connectionWAId) {
      status = !!cacheConnectionsWAOnline.get(dto.connectionWAId);
    }

    return {
      message: "OK!",
      status: 201,
      chatbot: {
        id,
        createAt,
        business: Business,
        status,
      },
    };
  }
}
