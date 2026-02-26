import { UploadImageRootController } from "./Controller";
import { UploadImageRootUseCase } from "./UseCase";

export const uploadImageRootController = UploadImageRootController(
  new UploadImageRootUseCase(),
).execute;
