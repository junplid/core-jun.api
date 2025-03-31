import { GetTagsController } from "./Controller";
import { GetTagsUseCase } from "./UseCase";

export const getTagsController = GetTagsController(
  new GetTagsUseCase()
).execute;
