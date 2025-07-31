import { CreateMenuOnlineController } from "./Controller";
import { CreateMenuOnlineUseCase } from "./UseCase";

export const createMenuOnlineController = CreateMenuOnlineController(
  new CreateMenuOnlineUseCase()
).execute;
