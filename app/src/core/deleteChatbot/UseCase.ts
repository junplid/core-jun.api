import { DeleteChatbotRepository_I } from "./Repository";
import { DeleteChatbotDTO_I } from "./DTO";

export class DeleteChatbotUseCase {
  constructor(private repository: DeleteChatbotRepository_I) {}

  async run(dto: DeleteChatbotDTO_I) {
    await this.repository.delete(dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
