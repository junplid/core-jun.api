import { DeleteTagOnContactWAController } from "./Controller";
import { DeleteTagOnContactWAUseCase } from "./UseCase";

export const deleteTagOnContactWAController = DeleteTagOnContactWAController(
  new DeleteTagOnContactWAUseCase()
).execute;
