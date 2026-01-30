import { Router } from "express";
import { createShootingSpeedValidation } from "../../../../../core/createShootingSpeed/Validation";
import { createShootingSpeedController } from "../../../../../core/createShootingSpeed";
import { appendFlowAccountValidation } from "../../../../../core/appendFlowAccount/Validation";
import { appendFlowAccountController } from "../../../../../core/appendFlowAccount";
import { csrfMiddleware } from "../../../../middlewares/csrf";

const RouterV1Root_Post = Router();

RouterV1Root_Post.post(
  "/shooting-speed",
  csrfMiddleware,
  createShootingSpeedValidation,
  createShootingSpeedController,
);

RouterV1Root_Post.post(
  "/append-flow",
  csrfMiddleware,
  appendFlowAccountValidation,
  appendFlowAccountController,
);

export default RouterV1Root_Post;
