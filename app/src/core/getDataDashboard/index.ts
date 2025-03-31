import { prisma } from "../../adapters/Prisma/client";
import { GetDataDashboardController } from "./Controller";
import { GetDataDashboardImplementation } from "./Implementation";
import { GetDataDashboardUseCase } from "./UseCase";

const getDataDashboardImplementation = new GetDataDashboardImplementation(
  prisma
);
const getDataDashboardUseCase = new GetDataDashboardUseCase(
  getDataDashboardImplementation
);

export const getDataDashboardController = GetDataDashboardController(
  getDataDashboardUseCase
).execute;
