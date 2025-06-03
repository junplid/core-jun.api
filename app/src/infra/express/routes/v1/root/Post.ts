import { Router } from "express";
import { createShootingSpeedValidation } from "../../../../../core/createShootingSpeed/Validation";
import { createShootingSpeedController } from "../../../../../core/createShootingSpeed";

const RouterV1Root_Post = Router();

RouterV1Root_Post.post(
  "/shooting-speed",
  createShootingSpeedValidation,
  createShootingSpeedController
);

export default RouterV1Root_Post;
