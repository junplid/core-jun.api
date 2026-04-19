import { GetMenuOnlineItems2Controller } from "./Controller";
import { GetMenuOnlineItems2UseCase } from "./UseCase";

export const getMenuOnlineItems2Controller = GetMenuOnlineItems2Controller(
  new GetMenuOnlineItems2UseCase(),
).execute;
