import { Router } from "express";
import { createExtraPackageController } from "../../../../../core/createExtraPackage";
import { createExtraPackageValidation } from "../../../../../core/createExtraPackage/Validation";
import { createPlanController } from "../../../../../core/createPlan";
import { createPlanValidation } from "../../../../../core/createPlan/Validation";
import { createRootCampaignParameterRangesConfigController } from "../../../../../core/createRootCampaignParameterRangesConfig";
import { createRootCampaignParameterRangesConfigValidation } from "../../../../../core/createRootCampaignParameterRangesConfig/Validation";
import { createAffiliateController } from "../../../../../core/createAffiliate";
import { createAffiliateValidation } from "../../../../../core/createAffiliate/Validation";
import { createCouponValidation } from "../../../../../core/createCoupon/Validation";
import { createCouponController } from "../../../../../core/createCoupon";
import { createConnectionsWARootValidation } from "../../../../../core/createConnectionsWARoot/Validation";
import { createConnectionsWARootController } from "../../../../../core/createConnectionsWARoot";

const RouterV1Root_Post = Router();

RouterV1Root_Post.post(
  "/create-plan",
  createPlanValidation,
  createPlanController
);

RouterV1Root_Post.post(
  "/campaign-parameter-range",
  createRootCampaignParameterRangesConfigValidation,
  createRootCampaignParameterRangesConfigController
);

RouterV1Root_Post.post(
  "/extra-package",
  createExtraPackageValidation,
  createExtraPackageController
);

RouterV1Root_Post.post(
  "/affiliate",
  createAffiliateValidation,
  createAffiliateController
);

RouterV1Root_Post.post(
  "/coupon",
  createCouponValidation,
  createCouponController
);

RouterV1Root_Post.post(
  "/connections-wa",
  createConnectionsWARootValidation,
  createConnectionsWARootController
);

export default RouterV1Root_Post;
