import { DeleteShootingSpeeController } from "./Controller";
import { DeleteShootingSpeeUseCase } from "./UseCase";

export const deleteShootingSpeeController = DeleteShootingSpeeController(
  new DeleteShootingSpeeUseCase()
).execute;
