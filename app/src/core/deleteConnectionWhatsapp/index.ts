import { DeleteConnectionWhatsappImplementation } from "./Implementation";
import { DeleteConnectionWhatsappController } from "./Controller";
import { DeleteConnectionWhatsappUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteConnectionWhatsappImplementation =
  new DeleteConnectionWhatsappImplementation(prisma);
const deleteConnectionWhatsappUseCase = new DeleteConnectionWhatsappUseCase(
  deleteConnectionWhatsappImplementation
);

export const deleteConnectionWhatsappController =
  DeleteConnectionWhatsappController(deleteConnectionWhatsappUseCase).execute;
