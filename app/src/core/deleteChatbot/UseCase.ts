import { DeleteChatbotDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";

export class DeleteChatbotUseCase {
  constructor() {}

  async run(dto: DeleteChatbotDTO_I) {
    await prisma.chatbot.delete({ where: dto });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
