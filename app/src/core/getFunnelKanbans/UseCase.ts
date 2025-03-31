import { GetFunnelKanbansDTO_I } from "./DTO";
import { GetFunnelKanbansRepository_I } from "./Repository";

export class GetFunnelKanbansUseCase {
  constructor(private repository: GetFunnelKanbansRepository_I) {}

  async run(dto: GetFunnelKanbansDTO_I) {
    const kanban = await this.repository.get(dto);

    return {
      message: "OK!",
      status: 200,
      kanban,
    };
  }
}
