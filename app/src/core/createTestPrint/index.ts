import { CreateTestPrintController } from "./Controller";
import { CreateTestPrintUseCase } from "./UseCase";

export const createTestPrintController = CreateTestPrintController(
  new CreateTestPrintUseCase(),
).execute;
