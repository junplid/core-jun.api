import { GetFunnelKanbanRepository_I } from "./Repository";
import { GetFunnelKanbanDTO_I } from "./DTO";

export class GetFunnelKanbanUseCase {
  constructor(private repository: GetFunnelKanbanRepository_I) {}

  async run(dto: GetFunnelKanbanDTO_I) {
    const kanban = await this.repository.get(dto);

    return {
      message: "OK!",
      status: 200,
      kanban,
    };
  }
}
