import { GetSectorDetailsController } from "./Controller";
import { GetSectorDetailsUseCase } from "./UseCase";

export const getSectorDetailsController = GetSectorDetailsController(
  new GetSectorDetailsUseCase()
).execute;
