import moment from "moment-timezone";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { UpdateChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import {
  TypeActivation,
  TypeChatbotActivations,
  TypeMessageWhatsApp,
} from "@prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

interface PickConnection_I {
  Chatbot: {
    typeActivation: TypeActivation | null;
    typeMessageWhatsApp: TypeMessageWhatsApp | null;
    name: string;
    ChatbotMessageActivations: {
      type: TypeChatbotActivations | null;
      caseSensitive: boolean | null;
      ChatbotMessageActivationValues: {
        value: string;
      }[];
    }[];
    TimesWork: {
      startTime: string | null;
      endTime: string | null;
      dayOfWeek: number;
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

  async run({ status = true, ...dto }: UpdateChatbotDTO_I) {
    try {
      const exist = await prisma.chatbot.findFirst({
        where: { accountId: dto.accountId, id: dto.id },
      });

      if (!exist) {
        throw new ErrorResponse(400).toast({
          title: `Robô de recebimento não foi encontrado`,
          type: "error",
        });
      }

      let pickConnection: null | PickConnection_I = null;
      if (dto.connectionOnBusinessId) {
        pickConnection = await prisma.connectionWA.findFirst({
          where: {
            id: dto.connectionOnBusinessId,
            Business: { accountId: dto.accountId, id: dto.businessId },
          },
          select: {
            Chatbot: {
              select: {
                typeActivation: true,
                typeMessageWhatsApp: true,
                ChatbotMessageActivations: {
                  select: {
                    caseSensitive: true,
                    type: true,
                    ChatbotMessageActivationValues: {
                      select: {
                        value: true,
                      },
                    },
                  },
                },
                id: true,
                name: true,
                TimesWork: {
                  select: { startTime: true, endTime: true, dayOfWeek: true },
                },
              },
            },
          },
        });

        if (!pickConnection) {
          throw new ErrorResponse(400).toast({
            title: `Conexão whatsapp não encontrada`,
            type: "error",
          });
        }
      }

      const {
        ChatbotInactivity,
        ChatbotAlternativeFlows,
        ChatbotMessageActivations,
        ChatbotMessageActivationsFail,
        leadOriginList,
        insertTagsLead,
        timesWork,
        id,
        accountId,
        ...rest
      } = dto;

      // regras aqui
      // se a conexão escolhida já estiver sendo usada por outro chatbot
      //      - verificar se já existe mesmo dia            ok
      //        - verificar se existe mesmo horario
      //          - verificar se existe a mesma ativação
      if (pickConnection && pickConnection.Chatbot.length) {
        for (const chatbot of pickConnection.Chatbot) {
          let isConflitActivation: boolean | undefined = false;
          let isConflitTypeMessage: boolean | undefined = false;
          if (
            chatbot.typeActivation === "message" &&
            dto.typeActivation === "message"
          ) {
            if (chatbot.typeMessageWhatsApp === "anyMessage") {
              isConflitTypeMessage = true;
            }

            if (
              chatbot.typeMessageWhatsApp === "textDetermined" &&
              dto.typeMessageWhatsApp === "textDetermined"
            ) {
              isConflitActivation = dto.ChatbotMessageActivations?.some(
                (activation, index) => {
                  const actvChEx = chatbot.ChatbotMessageActivations?.[index];
                  const texts = actvChEx?.ChatbotMessageActivationValues.map(
                    (s) => s.value
                  );
                  if (actvChEx?.type === activation.type) {
                    return activation.text?.some((t, i) => t === texts[i]);
                  }
                }
              );
            }
          }

          if (dto.timesWork?.length) {
            for (const timesWork of chatbot.TimesWork) {
              const { startTime, endTime, dayOfWeek } = timesWork;

              for (const newChatbotTimesWork of dto.timesWork) {
                if (!newChatbotTimesWork.startTime || !startTime) {
                  if (newChatbotTimesWork.dayOfWeek === dayOfWeek) {
                    throw new ErrorResponse(400).input({
                      path: "timesWork",
                      text: "Conflito com intervalo de `horário permitido` com outro(s) receptivo(s) já existe(ntes).",
                    });
                  }
                }

                let isBettwenTime = false;
                if (
                  newChatbotTimesWork.startTime &&
                  newChatbotTimesWork.endTime &&
                  startTime &&
                  endTime &&
                  newChatbotTimesWork.dayOfWeek === dayOfWeek
                ) {
                  const timeStartChat = getTimeBR(
                    newChatbotTimesWork.startTime
                  );
                  const timeEndChat = getTimeBR(newChatbotTimesWork.endTime);

                  const isBettwenTimeStart = timeStartChat.isBetween(
                    getTimeBR(startTime),
                    getTimeBR(endTime)
                  );
                  const isBettwenTimeEnd = timeEndChat.isBetween(
                    getTimeBR(startTime),
                    getTimeBR(endTime)
                  );
                  isBettwenTime = isBettwenTimeEnd || isBettwenTimeStart;
                }
                console.log({
                  isBettwenTime,
                  isConflitActivation,
                  isConflitTypeMessage,
                });
                if (isBettwenTime && isConflitActivation) {
                  throw new ErrorResponse(400).input({
                    path: "timesWork",
                    text: "Conflito de ativação com outro(s) receptivo(s) já existe(ntes) no horário e dia selecionado com o texto determinado",
                  });
                }
                if (isBettwenTime && isConflitTypeMessage) {
                  throw new ErrorResponse(400).input({
                    path: "timesWork",
                    text: "Conflito de ativação com outro(s) receptivo(s) já existe(ntes) no horário e dia selecionado",
                  });
                }
              }
            }
          }
        }
      }

      if (ChatbotInactivity) {
        const inva = await prisma.chatbotInactivity.findFirst({
          where: { Chatbot: { id } },
          select: { id: true },
        });

        if (!inva) {
          await prisma.chatbotInactivity.create({
            data: {
              Chatbot: { connect: { id } },
              ...ChatbotInactivity,
            },
          });
        } else {
          await prisma.chatbotInactivity.update({
            where: { id },
            data: ChatbotInactivity,
          });
        }
      }

      if (ChatbotMessageActivations?.length) {
        await prisma.chatbotMessageActivations.deleteMany({
          where: { chatbotId: id },
        });

        await Promise.all(
          ChatbotMessageActivations.map(async (data) => {
            await prisma.chatbotMessageActivations.create({
              data: { chatbotId: id, ...data },
            });
          })
        );
      }

      const { ConnectionWA, Business, inputActivation } =
        await prisma.chatbot.update({
          where: { id, accountId },
          data: {
            ...rest,
            ...(leadOriginList?.length && { leadOriginList }),
            insertTagsLead: insertTagsLead
              ? insertTagsLead?.join("-")
              : undefined,
            ...(timesWork?.length && {
              TimesWork: {
                deleteMany: { chatbotId: id },
                createMany: {
                  data: timesWork.map((s) => ({ ...s, type: "chatbot" })),
                },
              },
            }),
            ...(ChatbotMessageActivationsFail && {
              ChatbotMessageActivationsFail: {
                upsert: {
                  where: { chatbotId: 1 },
                  create: ChatbotMessageActivationsFail,
                  update: ChatbotMessageActivationsFail,
                },
              },
            }),
            ...(ChatbotAlternativeFlows && {
              ChatbotAlternativeFlows: {
                upsert: {
                  create: ChatbotAlternativeFlows,
                  update: ChatbotAlternativeFlows,
                },
              },
            }),
          },
          select: {
            inputActivation: true,
            ConnectionWA: { select: { id: true, number: true } },
            Business: { select: { name: true } },
          },
        });

      let statusConn = false;

      if (ConnectionWA) {
        statusConn = !!sessionsBaileysWA
          .get(ConnectionWA.id)
          ?.ev.emit("connection.update", { connection: "open" });
      }
      let target: null | string = null;
      if (inputActivation && ConnectionWA) {
        target = `https://api.whatsapp.com/send?phone=${ConnectionWA.number}&text=${inputActivation}`;
      }

      return {
        message: "OK!",
        status: 201,
        chatbot: {
          target,
          type: dto.typeActivation,
          business: Business.name,
          statusConn: statusConn ? "ON" : "OFF",
        },
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar robô de recebimento`,
        type: "error",
      });
    }
  }
}
