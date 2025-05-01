import { GetTagForSelectController } from "./Controller";
import { GetTagForSelectUseCase } from "./UseCase";

export const getTagForSelectController = GetTagForSelectController(
  new GetTagForSelectUseCase()
).execute;
