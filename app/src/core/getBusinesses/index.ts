import { GetBusinessesController } from "./Controller";
import { GetBusinessesUseCase } from "./UseCase";

export const getBusinessesController = GetBusinessesController(
  new GetBusinessesUseCase()
).execute;
