import { GetSectorsImplementation } from "./Implementation";
import { GetSectorsController } from "./Controller";
import { GetSectorsUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getSectorsImplementation = new GetSectorsImplementation(prisma);
const getSectorsUseCase = new GetSectorsUseCase(getSectorsImplementation);

export const getSectorsController =
  GetSectorsController(getSectorsUseCase).execute;
