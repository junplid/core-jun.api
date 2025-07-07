import { Router } from "express";
import { updateRootUserController } from "../../../../../core/updateRootUser";
import { updateRootUserValidation } from "../../../../../core/updateRootUser/Validation";
import { updateRootConfigController } from "../../../../../core/updateRootConfig";
import { updateRootConfigValidation } from "../../../../../core/updateRootConfig/Validation";
import { updateShootingSpeedValidation } from "../../../../../core/updateShootingSpeed/Validation";
import { updateShootingSpeedController } from "../../../../../core/updateShootingSpeed";
import { updateAccountToPremiumValidation } from "../../../../../core/updateAccountToPremium/Validation";
import { updateAccountToPremiumController } from "../../../../../core/updateAccountToPremium";

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

RouterV1Root_Put.put(
  "/account-to-premium",
  updateAccountToPremiumValidation,
  updateAccountToPremiumController
);

export default RouterV1Root_Put;
