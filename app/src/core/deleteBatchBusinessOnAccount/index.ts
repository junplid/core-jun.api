import { DeleteBatchBusinessOnAccountImplementation } from "./Implementation";
import { DeleteBatchBusinessOnAccountController } from "./Controller";
import { DeleteBatchBusinessOnAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteBatchBusinessOnAccountImplementation =
  new DeleteBatchBusinessOnAccountImplementation(prisma);
const deleteBatchBusinessOnAccountUseCase =
  new DeleteBatchBusinessOnAccountUseCase(
    deleteBatchBusinessOnAccountImplementation
  );

export const deleteBatchBusinessOnAccountController =
  DeleteBatchBusinessOnAccountController(
    deleteBatchBusinessOnAccountUseCase
  ).execute;
