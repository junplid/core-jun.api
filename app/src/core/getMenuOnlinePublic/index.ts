import { GetMenuOnlinePublicController } from "./Controller";
import { GetMenuOnlinePublicUseCase } from "./UseCase";

export const getMenuOnlinePublicController = GetMenuOnlinePublicController(
  new GetMenuOnlinePublicUseCase()
).execute;
