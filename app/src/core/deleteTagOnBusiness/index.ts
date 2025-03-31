import { DeleteTagOnBusinessImplementation } from "./Implementation";
import { DeleteTagOnBusinessController } from "./Controller";
import { DeleteTagOnBusinessUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteTagOnBusinessImplementation = new DeleteTagOnBusinessImplementation(
  prisma
);
const deleteTagOnBusinessUseCase = new DeleteTagOnBusinessUseCase(
  deleteTagOnBusinessImplementation
);

export const deleteTagOnBusinessController = DeleteTagOnBusinessController(
  deleteTagOnBusinessUseCase
).execute;
