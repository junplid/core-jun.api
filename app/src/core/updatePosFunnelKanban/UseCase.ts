import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdatePosFunnelKanbanDTO_I } from "./DTO";
import { UpdatePosFunnelKanbanRepository_I } from "./Repository";

export class UpdatePosFunnelKanbanUseCase {
  constructor(private repository: UpdatePosFunnelKanbanRepository_I) {}

  async run({ userId, ...dto }: UpdatePosFunnelKanbanDTO_I) {
    const alreadyExists = await this.repository.alreadyExisting({
      columnId: dto.columnId,
      funnelKanbanId: dto.funnelKanbanId,
      userId,
    });

    if (!alreadyExists) {
      throw new ErrorResponse(400).toast({
        title: `Kanban ou coluna não encontrada`,
        type: "error",
      });
    }

    const nextSequence = alreadyExists.sequence + 1;
    await this.repository.update({ ...dto, nextSequence });

    return {
      message: "OK!",
      status: 200,
    };
  }
}
