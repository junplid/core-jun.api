import { DeleteConnectionWARootController } from "./Controller";
import { DeleteConnectionWARootUseCase } from "./UseCase";

export const deleteConnectionWARootController =
  DeleteConnectionWARootController(new DeleteConnectionWARootUseCase()).execute;
