import { Router } from "express";
import { getShootingSpeedsValidation } from "../../../../../core/getShootingSpeeds/Validation";
import { getShootingSpeedsController } from "../../../../../core/getShootingSpeeds";
import { getShootingSpeedValidation } from "../../../../../core/getShootingSpeed/Validation";
import { getShootingSpeedController } from "../../../../../core/getShootingSpeed";
import { getGeralLogsValidation } from "../../../../../core/getGeralLogs/Validation";
import { getGeralLogsController } from "../../../../../core/getGeralLogs";
import { getAgentTemplate_root_Validation } from "../../../../../core/getAgentTemplate_root/Validation";
import { getAgentTemplate_root_Controller } from "../../../../../core/getAgentTemplate_root";
import { getAgentTemplates_root_Validation } from "../../../../../core/getAgentTemplates_root/Validation";
import { getAgentTemplates_root_Controller } from "../../../../../core/getAgentTemplates_root";

const RouterV1Root_Get = Router();

RouterV1Root_Get.get("/verify-authorization", (_req, res, _next) => {
  return res.status(200).json({});
});

RouterV1Root_Get.get(
  "/shooting-speeds",
  getShootingSpeedsValidation,
  getShootingSpeedsController,
);

RouterV1Root_Get.get(
  "/shooting-speeds/:id",
  getShootingSpeedValidation,
  getShootingSpeedController,
);

RouterV1Root_Get.get(
  "/geral-logs",
  getGeralLogsValidation,
  getGeralLogsController,
);

RouterV1Root_Get.get(
  "/agent-templates/:id",
  getAgentTemplate_root_Validation,
  getAgentTemplate_root_Controller,
);

RouterV1Root_Get.get(
  "/agent-templates",
  getAgentTemplates_root_Validation,
  getAgentTemplates_root_Controller,
);

export default RouterV1Root_Get;
