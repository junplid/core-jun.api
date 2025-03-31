import { prisma } from "../../adapters/Prisma/client";
import { GetSectorsAttendantsForSelectHumanServiceController } from "./Controller";
import { GetSectorsAttendantsForSelectHumanServiceImplementation } from "./Implementation";
import { GetSectorsAttendantsForSelectHumanServiceUseCase } from "./UseCase";

const getSectorsAttendantsForSelectHumanServiceImplementation =
  new GetSectorsAttendantsForSelectHumanServiceImplementation(prisma);
const getSectorsAttendantsForSelectHumanServiceUseCase =
  new GetSectorsAttendantsForSelectHumanServiceUseCase(
    getSectorsAttendantsForSelectHumanServiceImplementation
  );

export const getSectorsAttendantsForSelectHumanServiceController =
  GetSectorsAttendantsForSelectHumanServiceController(
    getSectorsAttendantsForSelectHumanServiceUseCase
  ).execute;
