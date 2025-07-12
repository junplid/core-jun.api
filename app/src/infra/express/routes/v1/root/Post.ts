import { Router } from "express";
import { createShootingSpeedValidation } from "../../../../../core/createShootingSpeed/Validation";
import { createShootingSpeedController } from "../../../../../core/createShootingSpeed";
import { appendFlowAccountValidation } from "../../../../../core/appendFlowAccount/Validation";
import { appendFlowAccountController } from "../../../../../core/appendFlowAccount";

const RouterV1Root_Post = Router();

RouterV1Root_Post.post(
  "/shooting-speed",
  createShootingSpeedValidation,
  createShootingSpeedController
);

RouterV1Root_Post.post(
  "/append-flow",
  appendFlowAccountValidation,
  appendFlowAccountController
);

export default RouterV1Root_Post;
