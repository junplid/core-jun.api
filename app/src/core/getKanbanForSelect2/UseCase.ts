import { GeKanbanForSelectDTO_I } from "./DTO";
import { GeKanbanForSelectRepository_I } from "./Repository";

export class GeKanbanForSelectUseCase {
  constructor(private repository: GeKanbanForSelectRepository_I) {}

  async run(dto: GeKanbanForSelectDTO_I) {
    const kanbans = await this.repository.fetch(dto);
    return { message: "OK!", status: 200, kanbans };
  }
}
