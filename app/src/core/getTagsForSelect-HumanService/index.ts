import { prisma } from "../../adapters/Prisma/client";
import { GetTagsForSelectHumanServiceController } from "./Controller";
import { GetTagsForSelectHumanServiceImplementation } from "./Implementation";
import { GetTagsForSelectHumanServiceUseCase } from "./UseCase";

const getTagsForSelectHumanServiceImplementation =
  new GetTagsForSelectHumanServiceImplementation(prisma);
const getTagsForSelectHumanServiceUseCase =
  new GetTagsForSelectHumanServiceUseCase(
    getTagsForSelectHumanServiceImplementation
  );

export const getTagsForSelectHumanServiceController =
  GetTagsForSelectHumanServiceController(
    getTagsForSelectHumanServiceUseCase
  ).execute;
