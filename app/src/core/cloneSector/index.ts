import { CreateCloneSectorController } from "./Controller";
import { CreateCloneSectorUseCase } from "./UseCase";

export const createCloneSectorController = CreateCloneSectorController(
  new CreateCloneSectorUseCase()
).execute;
