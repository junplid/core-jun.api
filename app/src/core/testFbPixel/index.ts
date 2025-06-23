import { TestFbPixelController } from "./Controller";
import { TestFbPixelUseCase } from "./UseCase";

export const testFbPixelController = TestFbPixelController(
  new TestFbPixelUseCase()
).execute;
