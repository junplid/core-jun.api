import { CreateCloneFlowController } from "./Controller";
import { CreateCloneFlowUseCase } from "./UseCase";

export const createCloneFlowController = CreateCloneFlowController(
  new CreateCloneFlowUseCase()
).execute;
