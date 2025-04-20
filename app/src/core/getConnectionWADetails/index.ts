import { GetConnectionWADetailsController } from "./Controller";
import { GetConnectionWADetailsUseCase } from "./UseCase";

export const getConnectionWADetailsController =
  GetConnectionWADetailsController(new GetConnectionWADetailsUseCase()).execute;
