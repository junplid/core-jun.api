import { Router } from "express";
import { deleteShootingSpeeValidation } from "../../../../../core/deleteShootingSpeed/Validation";
import { deleteShootingSpeeController } from "../../../../../core/deleteShootingSpeed";
import { csrfMiddleware } from "../../../../middlewares/csrf";

const RouterV1Root_Delete = Router();

RouterV1Root_Delete.delete(
  "/shooting-speed/:id",
  csrfMiddleware,
  deleteShootingSpeeValidation,
  deleteShootingSpeeController,
);

export default RouterV1Root_Delete;
