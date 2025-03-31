import { prisma } from "../../adapters/Prisma/client";
import { GetSomeAccountController } from "./Controller";
import { GetSomeAccountImplementation } from "./Implementation";
import { GetSomeAccountUseCase } from "./UseCase";

const getSomeAccountImplementation = new GetSomeAccountImplementation(prisma);
const getSomeAccountUseCase = new GetSomeAccountUseCase(
  getSomeAccountImplementation
);

export const getSomeAccountController = GetSomeAccountController(
  getSomeAccountUseCase
).execute;
