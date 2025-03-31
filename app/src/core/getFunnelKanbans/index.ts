import { prisma } from "../../adapters/Prisma/client";
import { GetFunnelKanbansController } from "./Controller";
import { GetFunnelKanbansImplementation } from "./Implementation";
import { GetFunnelKanbansUseCase } from "./UseCase";

const getFunnelKanbansImplementation = new GetFunnelKanbansImplementation(
  prisma
);
const getFunnelKanbansUseCase = new GetFunnelKanbansUseCase(
  getFunnelKanbansImplementation
);

export const getFunnelKanbansController = GetFunnelKanbansController(
  getFunnelKanbansUseCase
).execute;
