import { GetServicesTodayController } from "./Controller";
import { GetServicesTodayUseCase } from "./UseCase";

export const getServicesTodayController = GetServicesTodayController(
  new GetServicesTodayUseCase(),
).execute;
