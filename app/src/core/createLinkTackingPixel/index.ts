import { CreateLinkTackingPixelImplementation } from "./Implementation";
import { CreateLinkTackingPixelController } from "./Controller";
import { CreateLinkTackingPixelUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createLinkTackingPixelImplementation =
  new CreateLinkTackingPixelImplementation(prisma);
const createLinkTackingPixelUseCase = new CreateLinkTackingPixelUseCase(
  createLinkTackingPixelImplementation
);

export const createLinkTackingPixelController =
  CreateLinkTackingPixelController(createLinkTackingPixelUseCase).execute;
