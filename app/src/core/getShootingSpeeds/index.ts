import { GetShootingSpeedsController } from "./Controller";
import { GetShootingSpeedsUseCase } from "./UseCase";

export const getShootingSpeedsController = GetShootingSpeedsController(
  new GetShootingSpeedsUseCase()
).execute;
