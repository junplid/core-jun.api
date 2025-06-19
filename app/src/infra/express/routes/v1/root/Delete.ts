import { Router } from "express";
import { deleteShootingSpeeValidation } from "../../../../../core/deleteShootingSpeed/Validation";
import { deleteShootingSpeeController } from "../../../../../core/deleteShootingSpeed";

const RouterV1Root_Delete = Router();

RouterV1Root_Delete.delete(
  "/shooting-speed/:id",
  deleteShootingSpeeValidation,
  deleteShootingSpeeController
);

export default RouterV1Root_Delete;
