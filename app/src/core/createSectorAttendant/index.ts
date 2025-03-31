import { CreateSectorAttendantImplementation } from "./Implementation";
import { CreateSectorAttendantController } from "./Controller";
import { CreateSectorAttendantUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createSectorAttendantImplementation =
  new CreateSectorAttendantImplementation(prisma);
const createSectorAttendantUseCase = new CreateSectorAttendantUseCase(
  createSectorAttendantImplementation
);

export const createSectorAttendantController = CreateSectorAttendantController(
  createSectorAttendantUseCase
).execute;
