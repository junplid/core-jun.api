import { CloneLinkTackingPixelController } from "./Controller";
import { CloneLinkTackingPixelUseCase } from "./UseCase";

export const cloneLinkTackingPixelController = CloneLinkTackingPixelController(
  new CloneLinkTackingPixelUseCase()
).execute;
