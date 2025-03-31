import { prisma } from "../../adapters/Prisma/client";
import { GetTagsContactAccountController } from "./Controller";
import { GetTagsContactAccountImplementation } from "./Implementation";
import { GetTagsContactAccountUseCase } from "./UseCase";

const getTagsContactAccountImplementation =
  new GetTagsContactAccountImplementation(prisma);
const getTagsContactAccountUseCase = new GetTagsContactAccountUseCase(
  getTagsContactAccountImplementation
);

export const getTagsContactAccountController = GetTagsContactAccountController(
  getTagsContactAccountUseCase
).execute;
