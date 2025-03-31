import { GetSectorsAttendantsForSelectImplementation } from "./Implementation";
import { GetSectorsAttendantsForSelectController } from "./Controller";
import { GetSectorsAttendantsForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getSectorsAttendantsForSelectImplementation =
  new GetSectorsAttendantsForSelectImplementation(prisma);
const getSectorsAttendantsForSelectUseCase =
  new GetSectorsAttendantsForSelectUseCase(
    getSectorsAttendantsForSelectImplementation
  );

export const getSectorsAttendantsForSelectController =
  GetSectorsAttendantsForSelectController(
    getSectorsAttendantsForSelectUseCase
  ).execute;
