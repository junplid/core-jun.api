import { Router } from "express";
import { updateRootUserController } from "../../../../../core/updateRootUser";
import { updateRootUserValidation } from "../../../../../core/updateRootUser/Validation";
import { updateRootConfigController } from "../../../../../core/updateRootConfig";
import { updateRootConfigValidation } from "../../../../../core/updateRootConfig/Validation";

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

export default RouterV1Root_Put;
