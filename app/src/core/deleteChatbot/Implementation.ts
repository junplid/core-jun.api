import { Prisma, PrismaClient } from "@prisma/client";
import { DeleteChatbotRepository_I, Props } from "./Repository";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class DeleteChatbotImplementation implements DeleteChatbotRepository_I {
  constructor(
    private prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {}

  async delete({ ...props }: Props): Promise<void> {
    try {
      await this.prisma.chatbot.delete({
        where: props,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Erro `Create checkpoint fetchAlreadyExists`.");
    }
  }
}
