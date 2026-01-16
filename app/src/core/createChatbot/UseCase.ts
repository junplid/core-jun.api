import { CreateChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import checkConflictOfOperatingDays from "../../helpers/checkConflictOfOperatingDays";

export class CreateChatbotUseCase {
  constructor() {}

  async run({ agentId, ...dto }: CreateChatbotDTO_I) {
    const getAccount = await prisma.account.findFirst({
      where: { id: dto.accountId },
      select: { isPremium: true },
    });
    if (!getAccount) throw new ErrorResponse(400).container("Não autorizado.");

    const countResource = await prisma.chatbot.count({
      where: { accountId: dto.accountId },
    });

    if (!getAccount.isPremium && countResource > 1) {
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
        text: "Já existe um `Bot` com esse nome.",
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
              trigger: true,
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
          text: "Conexão WA não encontrada.",
        });
      }

      if (pickConnection.Chatbot.length) {
        for (const oldChatbot of pickConnection.Chatbot) {
          if (!dto.operatingDays?.length || !oldChatbot.OperatingDays.length) {
            throw new ErrorResponse(400).input({
              path: "connectionWAId",
              text: `O bot de recepção "${oldChatbot.name}", que opera 24 horas por dia, 7 dias por semana, já utiliza a conexão WA.`,
            });
          }

          if (dto.trigger === oldChatbot.trigger) {
            throw new ErrorResponse(400).input({
              path: "trigger",
              text: `O bot de recepção "${oldChatbot.name}" com essa mesma conexão, já utiliza a mesma palavra-chave.`,
            });
          }

          if (!dto.trigger && !oldChatbot.trigger) {
            throw new ErrorResponse(400).input({
              path: "trigger",
              text: `O bot de recepção "${oldChatbot.name}" com essa mesma conexão, também não utiliza nenhuma palavra-chave.`,
            });
          }

          const conflicts = checkConflictOfOperatingDays(
            dto.operatingDays,
            oldChatbot.OperatingDays.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              workingTimes: day.WorkingTimes,
            }))
          );

          if (conflicts.length) {
            const errors = new ErrorResponse(400);
            conflicts.forEach((conflicts, index) => {
              if (conflicts.indexTime === undefined) {
                errors.input({
                  path: `operatingDays.${index}`,
                  text: conflicts.text,
                });
              } else {
                errors.input({
                  path: `operatingDays.${index}.workingTimes.${conflicts.indexTime}`,
                  text: conflicts.text,
                });
              }
            });
            throw errors;
          }
        }
      }
    }

    const { operatingDays, timeToRestart, ...data } = dto;

    const { id, Business, createAt } = await prisma.chatbot.create({
      data: {
        ...data,
        ...(timeToRestart && { TimeToRestart: { create: timeToRestart } }),
        ...(agentId && { AgentAI: { connect: { id: agentId } } }),
      },
      select: {
        // cbj: true, poderá vizualizar o link de redirecionamento para
        //            o anuncio no modal de view do chatbot
        Business: { select: { name: true, id: true } },
        id: true,
        createAt: true,
      },
    });

    if (operatingDays?.length) {
      for await (const operationDay of operatingDays) {
        await prisma.operatingDays.create({
          data: {
            chatbotId: id,
            dayOfWeek: operationDay.dayOfWeek,
            ...(operationDay.workingTimes?.length && {
              WorkingTimes: {
                createMany: { data: operationDay.workingTimes },
              },
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
