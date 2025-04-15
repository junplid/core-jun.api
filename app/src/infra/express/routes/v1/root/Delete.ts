import { Router } from "express";
// import { deleteExtraPackageController } from "../../../../../core/deleteExtraPackage";
// import { deleteExtraPackageValidation } from "../../../../../core/deleteExtraPackage/Validation";
// import { deletePlanController } from "../../../../../core/deletePlanRoot";
// import { deletePlanRootValidation } from "../../../../../core/deletePlanRoot/Validation";
// import { deleteRootCampaignParameterRangesConfigController } from "../../../../../core/deleteRootCampaignParameterRangesConfig";
// import { deleteRootCampaignParameterRangesConfigValidation } from "../../../../../core/deleteRootCampaignParameterRangesConfig/Validation";
// import { deleteAffiliatesController } from "../../../../../core/deleteAffiliate";
// import { deleteAffiliatesValidation } from "../../../../../core/deleteAffiliate/Validation";
// import { deleteCouponController } from "../../../../../core/deleteCoupon";
// import { deleteCouponValidation } from "../../../../../core/deleteCoupon/Validation";
import { deleteConnectionWARootController } from "../../../../../core/deleteConnectionWARoot";
import { deleteConnectionWARootValidation } from "../../../../../core/deleteConnectionWARoot/Validation";

const RouterV1Root_Delete = Router();

// RouterV1Root_Delete.delete(
//   "/plan/:id",
//   deletePlanRootValidation,
//   deletePlanController
// );

// RouterV1Root_Delete.delete(
//   "/campaign-parameter-range/:id",
//   deleteRootCampaignParameterRangesConfigValidation,
//   deleteRootCampaignParameterRangesConfigController
// );

// RouterV1Root_Delete.delete(
//   "/extra-package/:id",
//   deleteExtraPackageValidation,
//   deleteExtraPackageController
// );

// RouterV1Root_Delete.delete(
//   "/affiliate/:id",
//   deleteAffiliatesValidation,
//   deleteAffiliatesController
// );

// RouterV1Root_Delete.delete(
//   "/coupon/:id",
//   deleteCouponValidation,
//   deleteCouponController
// );

RouterV1Root_Delete.delete(
  "/connection-wa/:id",
  deleteConnectionWARootValidation,
  deleteConnectionWARootController
);

export default RouterV1Root_Delete;
