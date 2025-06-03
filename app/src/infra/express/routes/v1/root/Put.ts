import { Router } from "express";
import { updateRootUserController } from "../../../../../core/updateRootUser";
import { updateRootUserValidation } from "../../../../../core/updateRootUser/Validation";
import { updateRootConfigController } from "../../../../../core/updateRootConfig";
import { updateRootConfigValidation } from "../../../../../core/updateRootConfig/Validation";
import { updateShootingSpeedValidation } from "../../../../../core/updateShootingSpeed/Validation";
import { updateShootingSpeedController } from "../../../../../core/updateShootingSpeed";

const RouterV1Root_Put = Router();

RouterV1Root_Put.put(
  "/data",
  updateRootUserValidation,
  updateRootUserController
);

RouterV1Root_Put.put(
  "/root-config",
  updateRootConfigValidation,
  updateRootConfigController
);

RouterV1Root_Put.put(
  "/shooting-speed/:id",
  updateShootingSpeedValidation,
  updateShootingSpeedController
);

export default RouterV1Root_Put;
