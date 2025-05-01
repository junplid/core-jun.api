import moment from "moment-timezone";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { CreateChatbotDTO_I } from "./DTO";
import { CreateChatbotRepository_I } from "./Repository";
import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";

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

  async run({ ...dto }: CreateChatbotDTO_I) {
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
        text: "Já existe um `Chatbot` com esse nome",
      });
    }

    const { ...rest } = dto;

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
          path: "connectionOnBusinessId",
          text: "Conexão whatsapp não encontrada",
        });
      }

      // regras aqui
      // se a conexão escolhida já estiver sendo usada por outro chatbot
      //      - verificar se já existe mesmo dia
      //        - verificar se existe mesmo horario
      if (pickConnection.Chatbot.length) {
        for (const oldChatbot of pickConnection.Chatbot) {
          if (!dto.operatingDays?.length || !oldChatbot.OperatingDays.length) {
            throw new ErrorResponse(400).input({
              path: "connectionWAId",
              text: `O bot "${oldChatbot.name}", que opera 24 horas por dia, 7 dias por semana, já está utilizando esta conexão WA`,
            });
          }

          for (const oldOperatingDay of oldChatbot.OperatingDays) {
            for (const newOperatingDay of dto.operatingDays) {
              // significa que não tem horario e funcionara 24 horas nesse dia
              if (oldOperatingDay.dayOfWeek === newOperatingDay.dayOfWeek) {
                const workTimeIsFull =
                  !newOperatingDay.workingTimes?.length ||
                  !newOperatingDay.workingTimes?.length;

                if (workTimeIsFull) {
                  throw new ErrorResponse(400).input({
                    path: "timesWork",
                    text: "Conflito de `horário de funcionamento`1",
                  });
                }

                let isBettwenTime = false;

                const timeStartChat = getTimeBR(newOperatingDay.startTime);
                const timeEndChat = getTimeBR(newOperatingDay.endTime);

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

              if (
                newOperatingDay.startTime &&
                newOperatingDay.endTime &&
                startTime &&
                endTime &&
                newOperatingDay.dayOfWeek === dayOfWeek
              ) {
              }
              if (isBettwenTime) {
                throw new ErrorResponse(400).input({
                  path: "timesWork",
                  text: "Conflito de ativação com outro(s) receptivo(s) já existe(ntes) no horário e dia selecionado com o texto determinado",
                });
              }
            }
          }

          // para não dar error, por enquanto vou bloquear a criação de qualquer
          // tipo de robo que funciona 24hrs, por causa do conflito pela diferenças
          // de funcionamente de cada robo

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

    let status = false;
    if (dto.connectionWAId) {
      status = !!cacheConnectionsWAOnline.get(dto.connectionWAId);
    }

    return {
      message: "OK!",
      status: 201,
      chatbot: {
        ...rests,
        business: businessName,
        status,
      },
    };
  }
}
