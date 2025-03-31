import { DeleteStaticFileController } from "./Controller";
import { DeleteStaticFileUseCase } from "./UseCase";

export const deleteStaticFileController = DeleteStaticFileController(
  new DeleteStaticFileUseCase()
).execute;
