import { DeleteSectorAttendantImplementation } from "./Implementation";
import { DeleteSectorAttendantController } from "./Controller";
import { DeleteSectorAttendantUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteSectorAttendantImplementation =
  new DeleteSectorAttendantImplementation(prisma);
const deleteSectorAttendantUseCase = new DeleteSectorAttendantUseCase(
  deleteSectorAttendantImplementation
);

export const deleteSectorAttendantController = DeleteSectorAttendantController(
  deleteSectorAttendantUseCase
).execute;
