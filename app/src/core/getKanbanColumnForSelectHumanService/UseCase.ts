import { GeKanbanColumnForSelectHumanServiceDTO_I } from "./DTO";
import { GeKanbanColumnForSelectHumanServiceRepository_I } from "./Repository";

export class GeKanbanColumnForSelectHumanServiceUseCase {
  constructor(
    private repository: GeKanbanColumnForSelectHumanServiceRepository_I
  ) {}

  async run(dto: GeKanbanColumnForSelectHumanServiceDTO_I) {
    return {
      message: "OK!",
      status: 200,
      columns: await this.repository.fetch(dto),
    };
  }
}
