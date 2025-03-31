import { CreateTagOnBusinessImplementation } from "./Implementation";
import { CreateTagOnBusinessController } from "./Controller";
import { CreateTagOnBusinessUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createTagOnBusinessImplementation = new CreateTagOnBusinessImplementation(
  prisma
);
const createTagOnBusinessUseCase = new CreateTagOnBusinessUseCase(
  createTagOnBusinessImplementation
);

export const createTagOnBusinessController = CreateTagOnBusinessController(
  createTagOnBusinessUseCase
).execute;
