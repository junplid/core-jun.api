import { DeleteConnectionIGController } from "./Controller";
import { DeleteConnectionIGUseCase } from "./UseCase";

export const deleteConnectionIGController = DeleteConnectionIGController(
  new DeleteConnectionIGUseCase(),
).execute;
