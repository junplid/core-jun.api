import { prisma } from "../../adapters/Prisma/client";
import { GetSectorsForSelectHumanServiceController } from "./Controller";
import { GetSectorsForSelectHumanServiceImplementation } from "./Implementation";
import { GetSectorsForSelectHumanServiceUseCase } from "./UseCase";

const getSectorsForSelectHumanServiceImplementation =
  new GetSectorsForSelectHumanServiceImplementation(prisma);
const getSectorsForSelectHumanServiceUseCase =
  new GetSectorsForSelectHumanServiceUseCase(
    getSectorsForSelectHumanServiceImplementation
  );

export const getSectorsForSelectHumanServiceController =
  GetSectorsForSelectHumanServiceController(
    getSectorsForSelectHumanServiceUseCase
  ).execute;
