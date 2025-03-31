import { CreateBuyExtraPackageController } from "./Controller";
import { CreateBuyExtraPackageUseCase } from "./UseCase";

export const createBuyExtraPackageController = CreateBuyExtraPackageController(
  new CreateBuyExtraPackageUseCase()
).execute;
