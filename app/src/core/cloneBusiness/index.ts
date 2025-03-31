import { CreateCloneBusinessController } from "./Controller";
import { CreateCloneBusinessUseCase } from "./UseCase";

export const createCloneBusinessController = CreateCloneBusinessController(
  new CreateCloneBusinessUseCase()
).execute;
