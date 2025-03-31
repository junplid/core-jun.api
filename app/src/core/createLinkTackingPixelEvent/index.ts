import { CreateLinkTackingPixelEventImplementation } from "./Implementation";
import { CreateLinkTackingPixelEventController } from "./Controller";
import { CreateLinkTackingPixelEventUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createLinkTackingPixelEventImplementation =
  new CreateLinkTackingPixelEventImplementation(prisma);
const createLinkTackingPixelEventUseCase =
  new CreateLinkTackingPixelEventUseCase(
    createLinkTackingPixelEventImplementation
  );

export const createLinkTackingPixelEventController =
  CreateLinkTackingPixelEventController(
    createLinkTackingPixelEventUseCase
  ).execute;
