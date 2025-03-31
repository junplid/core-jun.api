import { GetAudienceOnAccountForSelectImplementation } from "./Implementation";
import { GetAudienceOnAccountForSelectController } from "./Controller";
import { GetAudienceOnAccountForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getAudienceOnAccountForSelectImplementation =
  new GetAudienceOnAccountForSelectImplementation(prisma);
const getAudienceOnAccountForSelectUseCase =
  new GetAudienceOnAccountForSelectUseCase(
    getAudienceOnAccountForSelectImplementation
  );

export const getAudienceOnAccountForSelectController =
  GetAudienceOnAccountForSelectController(
    getAudienceOnAccountForSelectUseCase
  ).execute;
