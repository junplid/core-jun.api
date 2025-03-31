import { GetSectorsForSelectImplementation } from "./Implementation";
import { GetSectorsForSelectController } from "./Controller";
import { GetSectorsForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getSectorsForSelectImplementation = new GetSectorsForSelectImplementation(
  prisma
);
const getSectorsForSelectUseCase = new GetSectorsForSelectUseCase(
  getSectorsForSelectImplementation
);

export const getSectorsForSelectController = GetSectorsForSelectController(
  getSectorsForSelectUseCase
).execute;
