import { GetPlansController } from "./Controller";
import { GetPlansUseCase } from "./UseCase";

export const getPlansController = GetPlansController(
  new GetPlansUseCase()
).execute;
