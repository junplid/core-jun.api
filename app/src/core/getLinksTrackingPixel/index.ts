import { GetLinksTrackingPixelController } from "./Controller";
import { GetLinksTrackingPixelUseCase } from "./UseCase";

export const getLinksTrackingPixelController = GetLinksTrackingPixelController(
  new GetLinksTrackingPixelUseCase()
).execute;
