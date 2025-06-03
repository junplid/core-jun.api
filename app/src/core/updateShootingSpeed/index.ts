import { UpdateShootingSpeedController } from "./Controller";
import { UpdateShootingSpeedUseCase } from "./UseCase";

export const updateShootingSpeedController = UpdateShootingSpeedController(
  new UpdateShootingSpeedUseCase()
).execute;
