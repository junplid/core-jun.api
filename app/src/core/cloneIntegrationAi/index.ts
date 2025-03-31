import { CreateCloneintegrationAiController } from "./Controller";
import { CreateCloneintegrationAiUseCase } from "./UseCase";

export const createCloneintegrationAiController =
  CreateCloneintegrationAiController(
    new CreateCloneintegrationAiUseCase()
  ).execute;
