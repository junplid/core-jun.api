import { GetChatbotDetailsDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetChatbotDetailsUseCase {
  constructor() {}

  async run(dto: GetChatbotDetailsDTO_I) {
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      include: {
        ConnectionWA: {
          select: { name: true, id: true, number: true },
        },
        TimesWork: {
          select: { startTime: true, dayOfWeek: true, endTime: true },
        },
        ChatbotInactivity: {
          select: { type: true, value: true, flowId: true },
        },
        ChatbotAlternativeFlows: {
          select: {
            receivingAudioMessages: true,
            receivingImageMessages: true,
            receivingNonStandardMessages: true,
            receivingVideoMessages: true,
          },
        },
        ChatbotMessageActivationsFail: {
          select: { image: true, text: true, audio: true },
        },
        ChatbotMessageActivations: {
          select: {
            caseSensitive: true,
            type: true,
            ChatbotMessageActivationValues: { select: { value: true } },
          },
        },
        Business: { select: { id: true, name: true } },
      },
    });

    if (!chatbot) {
      throw new ErrorResponse(400).toast({
        title: `Robô de recebimento não foi encontrado!`,
        type: "error",
      });
    }

    const {
      businessId,
      insertTagsLead,
      chatbotInactivityId,
      interrupted,
      accountId,
      TimesWork,
      Business,
      ChatbotInactivity,
      ChatbotAlternativeFlows,
      ChatbotMessageActivationsFail,
      ChatbotMessageActivations,
      ConnectionWA,
      ...rest
    } = chatbot;

    let target: null | string = null;
    if (chatbot.inputActivation && ConnectionWA) {
      target = `https://api.whatsapp.com/send?phone=${ConnectionWA.number}&text=${chatbot.inputActivation}`;
    }

    return {
      message: "OK!",
      status: 200,
      chatbot: {
        ...rest,
        type: chatbot.typeActivation,
        target,
        business: Business,
        connection: ConnectionWA,
        timesWork: TimesWork,
        insertTagsLead: insertTagsLead ? insertTagsLead.split("-") : undefined,
        ChatbotInactivity,
        ChatbotAlternativeFlows,
        ChatbotMessageActivationsFail,
        ChatbotMessageActivations: ChatbotMessageActivations.map(
          ({ ChatbotMessageActivationValues, ...rest }) => ({
            ...rest,
            text: ChatbotMessageActivationValues.map((d) => d.value),
          })
        ),
      },
    };
  }
}
