import { prisma } from "../../adapters/Prisma/client";
import { GetLinkTrackingPixelForSelectController } from "./Controller";
import { GetLinkTrackingPixelForSelectImplementation } from "./Implementation";
import { GetLinkTrackingPixelForSelectUseCase } from "./UseCase";

const getLinkTrackingPixelForSelectImplementation =
  new GetLinkTrackingPixelForSelectImplementation(prisma);
const getLinkTrackingPixelForSelectUseCase =
  new GetLinkTrackingPixelForSelectUseCase(
    getLinkTrackingPixelForSelectImplementation
  );

export const getLinkTrackingPixelForSelectController =
  GetLinkTrackingPixelForSelectController(
    getLinkTrackingPixelForSelectUseCase
  ).execute;
