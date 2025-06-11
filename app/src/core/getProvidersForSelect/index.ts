import { GetProvidersForSelectController } from "./Controller";
import { GetProvidersForSelectUseCase } from "./UseCase";

export const getProvidersForSelectController = GetProvidersForSelectController(
  new GetProvidersForSelectUseCase()
).execute;
