import { UpdateHelpSessionController } from "./Controller";
import { UpdateHelpSessionUseCase } from "./UseCase";

const updateHelpSessionUseCase = new UpdateHelpSessionUseCase();

export const updateHelpSessionController = UpdateHelpSessionController(
  updateHelpSessionUseCase
).execute;
