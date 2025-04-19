import { DeleteTagController } from "./Controller";
import { DeleteTagUseCase } from "./UseCase";

export const deleteTagController = DeleteTagController(
  new DeleteTagUseCase()
).execute;
