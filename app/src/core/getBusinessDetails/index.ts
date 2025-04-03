import { GetBusinessDetailsController } from "./Controller";
import { GetBusinessDetailsUseCase } from "./UseCase";

export const getBusinessDetailsController = GetBusinessDetailsController(
  new GetBusinessDetailsUseCase()
).execute;
