import moment from "moment-timezone";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { CreateChatbotDTO_I } from "./DTO";
import { CreateChatbotRepository_I } from "./Repository";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";

function arraysAreEqual(
  arrayA: boolean[],
  arrayB: boolean[],
  validLength = true
) {
  if (validLength) {
    if (arrayA.length !== arrayB.length) return false;
  }

  for (let i = 0; i < arrayA.length; i++) {
    if (arrayA[i] !== arrayB[i]) return false;
  }

  return true;
}

function getTimeBR(time: string) {
  return moment()
    .tz("America/Sao_Paulo")
    .set({
      hours: Number(time.slice(0, 2)),
      minutes: Number(time.slice(3, 5)),
    });
}

export class CreateChatbotUseCase {
  constructor(private repository: CreateChatbotRepository_I) {}

  async run({ status = true, ...dto }: CreateChatbotDTO_I) {
    // const countResource = await prisma.chatbot.count({
    //   where: { accountId: dto.accountId },
    // });
    // const assets = await prisma.account.findFirst({
    //   where: { id: dto.accountId },
    //   select: {
    //     Plan: {
    //       select: { PlanAssets: { select: { business: true } } },
    //     },
    //     AccountSubscriptions: {
    //       where: { dateOfCancellation: null },
    //       select: {
    //         type: true,
    //         subscriptionsId: true,
    //         PlanPeriods: {
    //           select: {
    //             Plan: {
    //               select: { PlanAssets: { select: { chatbots: true } } },
    //             },
    //           },
    //         },
    //         ExtraPackage: {
    //           where: { type: "chatbotConversations" },
    //           select: { amount: true },
    //         },
    //       },
    //     },
    //   },
    // });
    // if (assets?.AccountSubscriptions.length) {
    //   const listExtraAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.ExtraPackage) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub) return (sub.ExtraPackage?.amount || 0) * -1;
    //       }
    //       return sub.ExtraPackage?.amount || 0;
    //     })
    //   );
    //   const totalAmountExtra = listExtraAmount.reduce(
    //     (prv, cur) => prv + cur,
    //     0
    //   );

    //   const listPlanAmount = await Promise.all(
    //     assets.AccountSubscriptions.map(async (sub) => {
    //       if (sub.PlanPeriods) {
    //         const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
    //         if (!isValidSub)
    //           return (sub.PlanPeriods.Plan.PlanAssets.chatbots || 0) * -1;
    //       }
    //       return sub.PlanPeriods?.Plan.PlanAssets.chatbots || 0;
    //     })
    //   );
    //   const totalPlanExtra = listPlanAmount.reduce((prv, cur) => prv + cur, 0);

    //   const total = totalPlanExtra + totalAmountExtra;

    //   if (total - countResource <= 0) {
    //     throw new ErrorResponse(400).toast({
    //       title:
    //         "Limite de Chatbots receptivos atingido. compre mais pacotes extra",

    //       type: "error",
    //     });
    //   }
    // } else {
    //   if (assets?.Plan && countResource >= assets.Plan.PlanAssets.business) {
    //     throw new ErrorResponse(400).toast({
    //       title:
    //         "Limite de Chatbot receptivos atingido. compre mais pacotes extra",

    //       type: "error",
    //     });
    //   }
    // }

    const exist = await this.repository.fetchExist({
      accountId: dto.accountId,
      name: dto.name,
      businessId: dto.businessId,
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe `Chatbot` com esse nome",
      });
    }

    const {
      ChatbotInactivity,
      ChatbotAlternativeFlows,
      ChatbotMessageActivations,
      ChatbotMessageActivationsFail,
      leadOriginList,
      insertTagsLead,
      inputActivation,
      timesWork,
      ...rest
    } = dto;

    if (dto.connectionOnBusinessId) {
      const pickConnection = await prisma.connectionWA.findFirst({
        where: {
          id: dto.connectionOnBusinessId,
          Business: { accountId: dto.accountId, id: dto.businessId },
        },
        select: {
          Chatbot: {
            select: {
              inputActivation: true,
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
        throw new ErrorResponse(400).input({
          path: "connectionOnBusinessId",
          text: "Conexão whatsapp não encontrada",
        });
      }

      // regras aqui
      // se a conexão escolhida já estiver sendo usada por outro chatbot
      //      - verificar se já existe mesmo dia            ok
      //        - verificar se existe mesmo horario
      //          - verificar se existe a mesma ativação
      if (pickConnection.Chatbot.length) {
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
                    return activation.text.some((t, i) => t === texts[i]);
                  }
                }
              );
            }
          }

          if (
            (chatbot.typeActivation === "link" ||
              chatbot.typeActivation === "qrcode") &&
            (dto.typeActivation === "link" || dto.typeActivation === "qrcode")
          ) {
            isConflitActivation =
              chatbot.inputActivation === dto.inputActivation;
          }

          if (dto.timesWork) {
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

          // para não dar error, por enquanto vou bloquear a criação de qualquer
          // tipo de robo que funciona 24hrs, por causa do conflito pela diferenças
          // de funcionamente de cada robo

          if (
            chatbot.typeActivation !== dto.typeActivation &&
            !dto.timesWork?.length
          ) {
            throw new ErrorResponse(400)
              .input({
                path: "typeActivation",
                text: "Conflito de ativação com outras conexões",
              })
              .input({
                path: "connectionOnBusinessId",
                text: "Conflito de ativação com outras conexões",
              });
          }

          // if (
          //   chatbot.typeActivation &&
          //   chatbot.typeActivation !== "message" &&
          //   dto.typeActivation === "message" &&
          //   !dto.timesWork?.length
          // ) {
          //   throw {
          //     message: "Conflito de conexões. Utilize outra conexão!",
          //     statusCode: 400,
          //   };
          // }
        }
      }
    }
    const { businessName, numberConnection, ...rests } =
      await this.repository.create({
        ...rest,
        status,
        inputActivation,
        leadOriginList: leadOriginList,
        timesWork,
        insertTagsLead: insertTagsLead?.join("-"),
        ChatbotInactivity,
        ChatbotAlternativeFlows,
        ChatbotMessageActivationsFail,
      });

    if (dto.ChatbotMessageActivations?.length) {
      await Promise.all(
        dto.ChatbotMessageActivations.map(async (data) => {
          await this.repository.createActivations({
            chatbotId: rests.id,
            data,
          });
        })
      );
    }

    let statusConn = false;
    if (dto.connectionOnBusinessId) {
      statusConn = !!sessionsBaileysWA
        .get(dto.connectionOnBusinessId)
        ?.ev.emit("connection.update", { connection: "open" });
    }

    let target: null | string = null;
    if (inputActivation && numberConnection) {
      target = `https://api.whatsapp.com/send?phone=${numberConnection}&text=${inputActivation}`;
    }

    return {
      message: "OK!",
      status: 201,
      chatbot: {
        ...rests,
        business: businessName,
        type: rest.typeActivation,
        target,
        statusConn: statusConn ? "ON" : "OFF",
      },
    };
  }
}
