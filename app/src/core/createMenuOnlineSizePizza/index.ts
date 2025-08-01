import { CreateMenuOnlineSizePizzaController } from "./Controller";
import { CreateMenuOnlineSizePizzaUseCase } from "./UseCase";

export const createMenuOnlineSizePizzaController =
  CreateMenuOnlineSizePizzaController(
    new CreateMenuOnlineSizePizzaUseCase()
  ).execute;
