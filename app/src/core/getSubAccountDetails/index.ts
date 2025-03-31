import { GetSubAccountDetailsController } from "./Controller";
import { GetSubAccountDetailsUseCase } from "./UseCase";

export const getSubAccountDetailsController = GetSubAccountDetailsController(
  new GetSubAccountDetailsUseCase()
).execute;
