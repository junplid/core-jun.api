import { CloneAudienceController } from "./Controller";
import { CloneAudienceUseCase } from "./UseCase";

export const cloneAudienceController = CloneAudienceController(
  new CloneAudienceUseCase()
).execute;
