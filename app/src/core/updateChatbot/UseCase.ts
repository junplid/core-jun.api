import moment from "moment-timezone";
import { UpdateChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import checkConflictOfOperatingDays from "../../helpers/checkConflictOfOperatingDays";

interface PickConnection_I {
  Chatbot: {
    name: string;
    operatingDays?: {
      dayOfWeek: number;
      workingTimes?: { start: string; end: string }[];
    }[];
  }[];
}

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

export class UpdateChatbotUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateChatbotDTO_I) {
    const exist = await prisma.chatbot.findFirst({
      where: { accountId, id },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Bot de recepção não foi encontrado.`,
        type: "error",
      });
    }
    if (exist && dto.name) {
      const existName = await prisma.chatbot.findFirst({
        where: {
          accountId: accountId,
          id: { not: id },
          name: dto.name,
        },
        select: { id: true },
      });
      if (existName) {
        throw new ErrorResponse(400).input({
          path: "name",
          text: "Já existe um Bot de recepção com esse nome.",
        });
      }
    }

    if (dto.connectionWAId) {
      const oldChatbots = await prisma.connectionWA.findFirst({
        where: {
          id: dto.connectionWAId,
          Business: { accountId: accountId, id: dto.businessId },
        },
        select: {
          Chatbot: {
            where: { id: { not: id } },
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

      if (!oldChatbots) {
        throw new ErrorResponse(400).input({
          path: "connectionWAId",
          text: "Conexão WA não encontrada.",
        });
      }

      if (oldChatbots.Chatbot.length) {
        for (const oldChatbot of oldChatbots.Chatbot) {
          if (
            // !dto.operatingDays !== undefined ||
            !dto.operatingDays?.length ||
            !oldChatbot.OperatingDays.length
          ) {
            throw new ErrorResponse(400).input({
              path: "connectionWAId",
              text: `O bot "${oldChatbot.name}", que opera 24/7, já utiliza a conexão WA.`,
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
            conflicts.forEach((conflicts) => {
              if (conflicts.indexTime === undefined) {
                errors.input({
                  path: `operatingDays.${conflicts.dayOfWeek}`,
                  text: conflicts.text,
                });
              } else {
                errors.input({
                  path: `operatingDays.${conflicts.dayOfWeek}.workingTimes.${conflicts.indexTime}`,
                  text: conflicts.text,
                });
              }
            });
            throw errors;
          }
        }
      }
    }

    const { operatingDays, timeToRestart, ...rest } = dto;
    try {
      const { ConnectionWA, Business, status } = await prisma.chatbot.update({
        where: { id, accountId },
        data: {
          ...rest,
          ...(operatingDays?.length && {
            OperatingDays: {
              deleteMany: {},
              create: operatingDays.map((day) => ({
                dayOfWeek: day.dayOfWeek,
                WorkingTimes: {
                  create: day.workingTimes?.map((time) => ({
                    start: time.start,
                    end: time.end,
                  })),
                },
              })),
            },
          }),
        },
        select: {
          ConnectionWA: { select: { id: true } },
          Business: { select: { name: true, id: true } },
          status: true,
        },
      });

      let statusConn = false;
      if (status && ConnectionWA?.id) {
        statusConn = !!cacheConnectionsWAOnline.get(ConnectionWA.id);
      }

      return {
        message: "OK!",
        status: 201,
        chatbot: {
          business: Business,
          status: statusConn,
        },
      };
    } catch (error) {
      console.log(error);
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar Bot de recepção`,
        type: "error",
      });
    }
  }
}
