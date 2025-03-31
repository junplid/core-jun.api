import { GetKanbanForSelectDTO_I } from "./DTO";
import { GetKanbanForSelectRepository_I } from "./Repository";

export class GetKanbanForSelectUseCase {
  constructor(private repository: GetKanbanForSelectRepository_I) {}

  async run(dto: GetKanbanForSelectDTO_I) {
    const kanban = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      kanban,
    };
  }
}
