import { LoginRootController } from "./Controller";
import { LoginRootUseCase } from "./UseCase";

export const loginRootController = LoginRootController(
  new LoginRootUseCase()
).execute;
