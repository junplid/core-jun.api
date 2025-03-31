import { GetTagDetailsController } from "./Controller";
import { GetTagDetailsUseCase } from "./UseCase";

export const getTagDetailsController = GetTagDetailsController(
  new GetTagDetailsUseCase()
).execute;
