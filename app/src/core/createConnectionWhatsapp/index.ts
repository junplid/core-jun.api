import { CreateConnectionWhatsappImplementation } from "./Implementation";
import { CreateConnectionWhatsappController } from "./Controller";
import { CreateConnectionWhatsappUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createConnectionWhatsappImplementation =
  new CreateConnectionWhatsappImplementation(prisma);
const createConnectionWhatsappUseCase = new CreateConnectionWhatsappUseCase(
  createConnectionWhatsappImplementation
);

export const createConnectionWhatsappController =
  CreateConnectionWhatsappController(createConnectionWhatsappUseCase).execute;
