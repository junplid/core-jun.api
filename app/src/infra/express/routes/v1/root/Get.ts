import { Router } from "express";
import { getShootingSpeedsValidation } from "../../../../../core/getShootingSpeeds/Validation";
import { getShootingSpeedsController } from "../../../../../core/getShootingSpeeds";
import { getShootingSpeedValidation } from "../../../../../core/getShootingSpeed/Validation";
import { getShootingSpeedController } from "../../../../../core/getShootingSpeed";
import { getGeralLogsValidation } from "../../../../../core/getGeralLogs/Validation";
import { getGeralLogsController } from "../../../../../core/getGeralLogs";

const RouterV1Root_Get = Router();

RouterV1Root_Get.get("/verify-authorization", (_req, res, _next) => {
  return res.status(200).json({});
});

RouterV1Root_Get.get(
  "/shooting-speeds",
  getShootingSpeedsValidation,
  getShootingSpeedsController
);

RouterV1Root_Get.get(
  "/shooting-speeds/:id",
  getShootingSpeedValidation,
  getShootingSpeedController
);

RouterV1Root_Get.get(
  "/geral-logs",
  getGeralLogsValidation,
  getGeralLogsController
);

export default RouterV1Root_Get;
