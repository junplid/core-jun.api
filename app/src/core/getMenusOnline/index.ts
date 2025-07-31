import { GetMenusOnlineController } from "./Controller";
import { GetMenusOnlineUseCase } from "./UseCase";

export const getMenusOnlineController = GetMenusOnlineController(
  new GetMenusOnlineUseCase()
).execute;
