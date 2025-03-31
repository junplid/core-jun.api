import { GetLinkTrackingPixelDetailsController } from "./Controller";
import { GetLinkTrackingPixelDetailsUseCase } from "./UseCase";

export const getLinkTrackingPixelDetailsController =
  GetLinkTrackingPixelDetailsController(
    new GetLinkTrackingPixelDetailsUseCase()
  ).execute;
