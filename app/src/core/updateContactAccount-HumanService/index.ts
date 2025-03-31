import { UpdateContactAccountHumanServiceController } from "./Controller";
import { UpdateContactAccountHumanServiceUseCase } from "./UseCase";

export const updateContactAccountHumanServiceController =
  UpdateContactAccountHumanServiceController(
    new UpdateContactAccountHumanServiceUseCase()
  ).execute;
