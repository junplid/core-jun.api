import { UpdateAccountToPremiumController } from "./Controller";
import { UpdateAccountToPremiumUseCase } from "./UseCase";

export const updateAccountToPremiumController =
  UpdateAccountToPremiumController(new UpdateAccountToPremiumUseCase()).execute;
