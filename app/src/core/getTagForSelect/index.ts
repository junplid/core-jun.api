import { prisma } from "../../adapters/Prisma/client";
import { GetTagForSelectController } from "./Controller";
import { GetTagForSelectImplementation } from "./Implementation";
import { GetTagForSelectUseCase } from "./UseCase";

const getTagForSelectImplementation = new GetTagForSelectImplementation(prisma);
const getTagForSelectUseCase = new GetTagForSelectUseCase(
  getTagForSelectImplementation
);

export const getTagForSelectController = GetTagForSelectController(
  getTagForSelectUseCase
).execute;
