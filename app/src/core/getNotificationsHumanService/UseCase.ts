import { GetNotificationsHumanServiceDTO_I } from "./DTO";
import { GetNotificationsHumanServiceRepository_I } from "./Repository";

export class GetNotificationsHumanServiceUseCase {
  constructor(private repository: GetNotificationsHumanServiceRepository_I) {}

  async run(dto: GetNotificationsHumanServiceDTO_I) {
    return {
      message: "OK!",
      status: 200,
      notifications: await this.repository.fetch(dto.userId),
    };
  }
}
