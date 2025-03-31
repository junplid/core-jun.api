import { CreateBusinessController } from "./Controller";
import { CreateBusinessUseCase } from "./UseCase";

export const createBusinessController = CreateBusinessController(
  new CreateBusinessUseCase()
).execute;
