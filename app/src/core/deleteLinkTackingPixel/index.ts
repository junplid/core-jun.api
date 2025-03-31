import { DeleteLinkTackingPixelImplementation } from "./Implementation";
import { DeleteLinkTackingPixelController } from "./Controller";
import { DeleteLinkTackingPixelUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteLinkTackingPixelImplementation =
  new DeleteLinkTackingPixelImplementation(prisma);
const deleteLinkTackingPixelUseCase = new DeleteLinkTackingPixelUseCase(
  deleteLinkTackingPixelImplementation
);

export const deleteLinkTackingPixelController =
  DeleteLinkTackingPixelController(deleteLinkTackingPixelUseCase).execute;
