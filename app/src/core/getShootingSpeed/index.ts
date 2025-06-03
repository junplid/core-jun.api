import { GetShootingSpeedController } from "./Controller";
import { GetShootingSpeedUseCase } from "./UseCase";

export const getShootingSpeedController = GetShootingSpeedController(
  new GetShootingSpeedUseCase()
).execute;
