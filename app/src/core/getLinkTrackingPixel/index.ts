import { GetLinkTrackingPixelController } from "./Controller";
import { GetLinkTrackingPixelUseCase } from "./UseCase";

export const getLinkTrackingPixelController = GetLinkTrackingPixelController(
  new GetLinkTrackingPixelUseCase()
).execute;
