import { UpdateLinkTackingPixelController } from "./Controller";
import { UpdateLinkTackingPixelUseCase } from "./UseCase";

export const updateLinkTackingPixelController =
  UpdateLinkTackingPixelController(new UpdateLinkTackingPixelUseCase()).execute;
