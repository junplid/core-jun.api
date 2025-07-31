import { GetMenuOnlineController } from "./Controller";
import { GetMenuOnlineUseCase } from "./UseCase";

export const getMenuOnlineController = GetMenuOnlineController(
  new GetMenuOnlineUseCase()
).execute;
