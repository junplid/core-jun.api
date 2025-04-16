import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ChatbotMessageActivations_I } from "./DTO";
import {
  CreateChatbotRepository_I,
  PropsCreate,
  ResultFetchExistConnection,
} from "./Repository";

export class CraeteSectorImplementation implements CreateChatbotRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async create({
    ChatbotAlternativeFlows,
    ChatbotInactivity,
    ChatbotMessageActivationsFail,
    timesWork,
    ...data
  }: PropsCreate): Promise<{
    readonly createAt: Date;
    readonly id: number;
    businessName: string;
    numberConnection?: string;
  }> {
    try {
      const Chatbot = await this.prisma.chatbot.create({
        data: {
          ...data,
          ...(timesWork?.length && {
            TimesWork: {
              createMany: {
                data: timesWork.map((s) => ({ ...s, type: "chatbot" })),
              },
            },
          }),
          ChatbotAlternativeFlows: { create: ChatbotAlternativeFlows },
          ChatbotMessageActivationsFail: {
            create: ChatbotMessageActivationsFail,
          },
        },
        select: {
          id: true,
          createAt: true,
          Business: { select: { name: true } },
          ConnectionWA: {
            select: { number: true },
          },
        },
      });
      if (ChatbotInactivity) {
        await this.prisma.chatbotInactivity.create({
          data: ChatbotInactivity,
        });
      }

      return {
        ...Chatbot!,
        businessName: Chatbot!.Business.name,
        numberConnection: Chatbot.ConnectionWA?.number ?? undefined,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Sector`.");
    }
  }

  async createActivations({
    chatbotId,
    data,
  }: {
    chatbotId: number;
    data: ChatbotMessageActivations_I;
  }): Promise<void> {
    try {
      const { text, ...rest } = data;
      await this.prisma.chatbotMessageActivations.create({
        data: {
          chatbotId,
          ...rest,
          ChatbotMessageActivationValues: {
            createMany: {
              data: text.map((s) => ({ value: s })),
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create Sector`.");
    }
  }

  async fetchExist(props: {
    name: string;
    accountId: number;
    businessId: number;
  }): Promise<number> {
    try {
      return await this.prisma.chatbot.count({
        where: {
          name: props.name,
          accountId: props.accountId,
          businessId: props.businessId,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Sector`.");
    }
  }

  async fetchExistConnection(props: {
    accountId: number;
    businessId: number;
    connectionId: number;
  }): Promise<ResultFetchExistConnection | null> {
    try {
      return await this.prisma.connectionWA.findFirst({
        where: {
          id: props.connectionId,
          Business: {
            accountId: props.accountId,
            id: props.businessId,
          },
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
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Fetch Sector`.");
    }
  }
}
