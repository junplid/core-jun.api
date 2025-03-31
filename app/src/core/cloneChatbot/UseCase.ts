import { prisma } from "../../adapters/Prisma/client";
import { isSubscriptionInOrder } from "../../libs/Asaas/isSubscriptionInOrder";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateCloneChatbotDTO_I } from "./DTO";

type TotalsAmountExtra = {
  [c in "chatbots"]?: number;
};

export class CreateCloneChatbotUseCase {
  constructor() {}

  async run({ accountId, id }: CreateCloneChatbotDTO_I) {
    const assets = await prisma.account.findFirst({
      where: { id: accountId },
      select: {
        Plan: { select: { PlanAssets: { select: { chatbots: true } } } },
        AccountSubscriptions: {
          where: { dateOfCancellation: null },
          select: {
            type: true,
            subscriptionsId: true,
            PlanPeriods: {
              select: {
                Plan: {
                  select: { PlanAssets: { select: { chatbots: true } } },
                },
              },
            },
            ExtraPackage: {
              where: { type: "chatbotConversations" },
              select: { amount: true, type: true },
            },
          },
        },
      },
    });

    if (assets?.AccountSubscriptions.length) {
      const listExtraAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.ExtraPackage) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            const v = sub.ExtraPackage.amount || 0;
            if (!isValidSub) return { v: v * -1, type: sub.ExtraPackage.type };
            return { v, type: sub.ExtraPackage.type };
          }
        })
      );

      const totalsAmountExtra: TotalsAmountExtra = listExtraAmount.reduce(
        (acc: any, cur) => {
          if (cur) {
            if (!acc[cur.type]) acc[cur.type] = 0;
            acc[cur.type] += cur.v;
            return acc;
          }
        },
        {}
      );

      const listPlanAssetsAmount = await Promise.all(
        assets.AccountSubscriptions.map(async (sub) => {
          if (sub.PlanPeriods) {
            const isValidSub = await isSubscriptionInOrder(sub.subscriptionsId);
            const planAssets = sub.PlanPeriods.Plan.PlanAssets;
            if (!isValidSub) {
              return { chatbots: (planAssets.chatbots || 0) * -1 };
            }
            return { chatbots: planAssets.chatbots || 0 };
          }
          0;
        })
      );

      const totalsAmountPlanAssets = listPlanAssetsAmount.reduce(
        (acc, curr) => {
          return {
            chatbots: (acc?.chatbots || 0) + (curr?.chatbots || 0),
          };
        },
        { chatbots: 0 }
      );

      const chatbots =
        (totalsAmountPlanAssets?.chatbots || 0) +
        (totalsAmountExtra.chatbots || 0);

      const countResource = await prisma.chatbot.count({
        where: { accountId },
      });

      const rest = chatbots - countResource;

      if (rest > 0) {
        const oldChatbot = await prisma.chatbot.findUnique({
          where: { id, accountId },
          include: {
            ChatbotAlternativeFlows: {
              select: {
                receivingAudioMessages: true,
                receivingImageMessages: true,
                receivingNonStandardMessages: true,
                receivingVideoMessages: true,
              },
            },
            ChatbotInactivity: {
              select: {
                flowId: true,
                type: true,
                value: true,
              },
            },
            ChatbotMessageActivations: {
              select: {
                caseSensitive: true,
                type: true,
                ChatbotMessageActivationValues: { select: { value: true } },
              },
            },
            ChatbotMessageActivationsFail: {
              select: {
                audio: true,
                text: true,
                image: true,
              },
            },
            TimesWork: {
              where: { type: "chatbot" },
              select: {
                endTime: true,
                startTime: true,
                dayOfWeek: true,
              },
            },
          },
        });

        if (oldChatbot) {
          const {
            interrupted,
            createAt,
            connectionOnBusinessId,
            chatbotInactivityId,
            ChatbotAlternativeFlows,
            ChatbotInactivity,
            ChatbotMessageActivations,
            ChatbotMessageActivationsFail,
            TimesWork,
            updateAt,
            id,
            ...rest
          } = oldChatbot;

          const nextName = oldChatbot.name + "_COPIA_" + new Date().getTime();

          const { Business, ...restNew } = await prisma.chatbot.create({
            data: {
              ...rest,
              name: nextName,
              ...(ChatbotAlternativeFlows && {
                ChatbotAlternativeFlows: { create: ChatbotAlternativeFlows },
              }),
              ...(TimesWork.length && {
                TimesWork: {
                  createMany: {
                    data: TimesWork.map((s) => ({ ...s, type: "chatbot" })),
                  },
                },
              }),
              ...(ChatbotMessageActivationsFail && {
                ChatbotMessageActivationsFail: {
                  create: ChatbotMessageActivationsFail,
                },
              }),
            },
            select: {
              description: true,
              name: true,
              id: true,
              createAt: true,
              Business: { select: { name: true } },
            },
          });

          if (ChatbotMessageActivations) {
            await Promise.all(
              ChatbotMessageActivations.map(
                async ({ ChatbotMessageActivationValues, ...rest }) => {
                  await prisma.chatbotMessageActivations.create({
                    data: {
                      ...rest,
                      chatbotId: id,
                      ChatbotMessageActivationValues: {
                        createMany: {
                          data: ChatbotMessageActivationValues.map(
                            ({ value }) => ({ value })
                          ),
                        },
                      },
                    },
                  });
                }
              )
            );
          }

          if (ChatbotInactivity) {
            await prisma.chatbotInactivity.create({
              data: {
                Chatbot: { connect: { id: restNew.id } },
                ...ChatbotInactivity,
              },
            });
          }

          return {
            message: "OK!",
            status: 200,
            chatbot: {
              ...restNew,
              business: Business.name,
              statusChatbot: "OFF",
              statusConn: "OFF",
            },
          };
        } else {
          throw new ErrorResponse(400).toast({
            title: "Robô de atendimento não encontrado",
            type: "error",
          });
        }
      } else {
        throw new ErrorResponse(400).toast({
          title: "Limite de robô atingido. compre mais pacotes extra!",
          type: "error",
        });
      }
    } else {
      if (assets?.Plan) {
        const countResource = await prisma.chatbot.count({
          where: { accountId },
        });

        const rest = assets.Plan.PlanAssets.chatbots - countResource;

        if (rest > 0) {
          const oldChatbot = await prisma.chatbot.findUnique({
            where: { id, accountId },
            include: {
              ChatbotAlternativeFlows: {
                select: {
                  receivingAudioMessages: true,
                  receivingImageMessages: true,
                  receivingNonStandardMessages: true,
                  receivingVideoMessages: true,
                },
              },
              ChatbotInactivity: {
                select: {
                  flowId: true,
                  type: true,
                  value: true,
                },
              },
              ChatbotMessageActivations: {
                select: {
                  caseSensitive: true,
                  type: true,
                  ChatbotMessageActivationValues: { select: { value: true } },
                },
              },
              ChatbotMessageActivationsFail: {
                select: {
                  audio: true,
                  text: true,
                  image: true,
                },
              },
              TimesWork: {
                where: { type: "chatbot" },
                select: {
                  endTime: true,
                  startTime: true,
                  dayOfWeek: true,
                },
              },
            },
          });

          if (oldChatbot) {
            const {
              interrupted,
              createAt,
              connectionOnBusinessId,
              chatbotInactivityId,
              ChatbotAlternativeFlows,
              ChatbotInactivity,
              ChatbotMessageActivations,
              ChatbotMessageActivationsFail,
              TimesWork,
              updateAt,
              id,
              ...rest
            } = oldChatbot;

            const nextName = oldChatbot.name + "_COPIA_" + new Date().getTime();

            const { Business, ...restNew } = await prisma.chatbot.create({
              data: {
                ...rest,
                name: nextName,
                ...(ChatbotAlternativeFlows && {
                  ChatbotAlternativeFlows: { create: ChatbotAlternativeFlows },
                }),
                ...(TimesWork.length && {
                  TimesWork: {
                    createMany: {
                      data: TimesWork.map((s) => ({ ...s, type: "chatbot" })),
                    },
                  },
                }),
                ...(ChatbotMessageActivationsFail && {
                  ChatbotMessageActivationsFail: {
                    create: ChatbotMessageActivationsFail,
                  },
                }),
              },
              select: {
                description: true,
                name: true,
                id: true,
                createAt: true,
                Business: { select: { name: true } },
              },
            });

            if (ChatbotMessageActivations) {
              await Promise.all(
                ChatbotMessageActivations.map(
                  async ({ ChatbotMessageActivationValues, ...rest }) => {
                    await prisma.chatbotMessageActivations.create({
                      data: {
                        ...rest,
                        chatbotId: id,
                        ChatbotMessageActivationValues: {
                          createMany: {
                            data: ChatbotMessageActivationValues.map(
                              ({ value }) => ({ value })
                            ),
                          },
                        },
                      },
                    });
                  }
                )
              );
            }

            if (ChatbotInactivity) {
              await prisma.chatbotInactivity.create({
                data: {
                  Chatbot: { connect: { id: restNew.id } },
                  ...ChatbotInactivity,
                },
              });
            }

            return {
              message: "OK!",
              status: 200,
              chatbot: {
                ...restNew,
                business: Business.name,
                statusChatbot: "OFF",
                statusConn: "OFF",
              },
            };
          } else {
            throw new ErrorResponse(400).toast({
              title: "Robô de atendimento não encontrado",
              type: "error",
            });
          }
        } else {
          throw new ErrorResponse(400).toast({
            title: "Limite de robô atingido. compre mais pacotes extra",
            type: "error",
          });
        }
      } else {
        throw new ErrorResponse(400).toast({
          title:
            "Não foi possivel encontrar o plano. Solicite o nosso suporte para resolver seu problema",
          type: "error",
        });
      }
    }
  }
}
