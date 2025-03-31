import { GetChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetChatbotUseCase {
  constructor() {}

  async run(dto: GetChatbotDTO_I) {
    const chatbot = await prisma.chatbot.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      orderBy: { id: "desc" },
      include: {
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
      },
    });

    if (!chatbot) {
      throw new ErrorResponse(400).toast({
        title: `Robô de recebimento não foi encontrado!`,
        type: "error",
      });
    }
    const {
      updateAt,
      createAt,
      insertTagsLead,
      chatbotInactivityId,
      interrupted,
      accountId,
      TimesWork,
      ChatbotInactivity,
      ChatbotAlternativeFlows,
      ChatbotMessageActivationsFail,
      ChatbotMessageActivations,
      ...rest
    } = chatbot;
    return {
      message: "OK!",
      status: 200,
      chatbot: {
        ...rest,
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
