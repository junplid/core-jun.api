import { Router } from "express";
import { getConfigAppController } from "../../../../../core/getConfigApp";
import { getConfigAppValidation } from "../../../../../core/getConfigApp/Validation";
import { getExtraPackagesRootController } from "../../../../../core/getExtraPackagesRoot";
import { getExtraPackagesRootValidation } from "../../../../../core/getExtraPackagesRoot/Validation";
import { getPlansRootController } from "../../../../../core/getPlansRoot";
import { getPlansRootValidation } from "../../../../../core/getPlansRoot/Validation";
import { getRootCampaignParameterRangesConfigController } from "../../../../../core/getRootCampaignParameterRangesConfig";
import { getRootCampaignParameterRangesConfigValidation } from "../../../../../core/getRootCampaignParameterRangesConfig/Validation";
import { getRootPlansForSelectController } from "../../../../../core/getRootPlansForSelect";
import { getRootPlansForSelectValidation } from "../../../../../core/getRootPlansForSelect/Validation";
import { getAffiliatesController } from "../../../../../core/getAffiliates";
import { getAffiliatesValidation } from "../../../../../core/getAffiliates/Validation";
import { getCouponsController } from "../../../../../core/getCoupons";
import { getCouponsValidation } from "../../../../../core/getCoupons/Validation";
import { getRootExtraPackagesForSelectValidation } from "../../../../../core/getRootExtraPackagesForSelect/Validation";
import { getRootExtraPackagesForSelectController } from "../../../../../core/getRootExtraPackagesForSelect";
import { getRootCouponsForSelectValidation } from "../../../../../core/getRootCouponsForSelect/Validation";
import { getRootCouponsForSelectController } from "../../../../../core/getRootCouponsForSelect";
import { getRootConfigValidation } from "../../../../../core/getRootConfig/Validation";
import { getRootConfigController } from "../../../../../core/getRootConfig";
import { getConnectionsWARootForSelectController } from "../../../../../core/getConnectionsWARootForSelect";
import { getConnectionsWARootForSelectValidation } from "../../../../../core/getConnectionsWARootForSelect/Validation";
import { getConnectionsWARootValidation } from "../../../../../core/getConnectionsWARoot/Validation";
import { getConnectionsWARootController } from "../../../../../core/getConnectionsWARoot";

const RouterV1Root_Get = Router();

RouterV1Root_Get.get("/rplans", getPlansRootValidation, getPlansRootController);

RouterV1Root_Get.get(
  "/campaign-parameter-range",
  getRootCampaignParameterRangesConfigValidation,
  getRootCampaignParameterRangesConfigController
);

RouterV1Root_Get.get("/verify-authorization", (_req, res, _next) => {
  return res.status(200).json({});
});

RouterV1Root_Get.get(
  "/plans-options",
  getRootPlansForSelectValidation,
  getRootPlansForSelectController
);

RouterV1Root_Get.get(
  "/extra-packages-options",
  getRootExtraPackagesForSelectValidation,
  getRootExtraPackagesForSelectController
);

RouterV1Root_Get.get(
  "/coupons-options",
  getRootCouponsForSelectValidation,
  getRootCouponsForSelectController
);

RouterV1Root_Get.get(
  "/extra-packages",
  getExtraPackagesRootValidation,
  getExtraPackagesRootController
);
RouterV1Root_Get.get(
  "/config-app",
  getConfigAppValidation,
  getConfigAppController
);

RouterV1Root_Get.get(
  "/affiliates",
  getAffiliatesValidation,
  getAffiliatesController
);

RouterV1Root_Get.get("/coupons", getCouponsValidation, getCouponsController);

RouterV1Root_Get.get(
  "/root-config",
  getRootConfigValidation,
  getRootConfigController
);

RouterV1Root_Get.get(
  "/connections-wa-options",
  getConnectionsWARootForSelectValidation,
  getConnectionsWARootForSelectController
);

RouterV1Root_Get.get(
  "/connections-wa",
  getConnectionsWARootValidation,
  getConnectionsWARootController
);

export default RouterV1Root_Get;
