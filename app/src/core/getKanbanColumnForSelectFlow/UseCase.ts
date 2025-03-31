import { GeKanbanColumnForSelectFlowDTO_I } from "./DTO";
import { GeKanbanColumnForSelectFlowRepository_I } from "./Repository";

export class GeKanbanColumnForSelectFlowUseCase {
  constructor(private repository: GeKanbanColumnForSelectFlowRepository_I) {}

  async run(dto: GeKanbanColumnForSelectFlowDTO_I) {
    const kanbans = await this.repository.fetch(dto);
    return { message: "OK!", status: 200, kanbans };
  }
}
