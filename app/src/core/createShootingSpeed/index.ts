import { CreateShootingSpeedController } from "./Controller";
import { CreateShootingSpeedUseCase } from "./UseCase";

export const createShootingSpeedController = CreateShootingSpeedController(
  new CreateShootingSpeedUseCase()
).execute;
