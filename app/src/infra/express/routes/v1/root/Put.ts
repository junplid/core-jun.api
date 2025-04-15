import { Router } from "express";
// import multer from "multer";
// import { resolve } from "path";
// import { storageMulter } from "../../../../../adapters/Multer/storage";
import { updateHelpSessionController } from "../../../../../core/updateAboutWhabot";
import { updateHelpSessionValidation } from "../../../../../core/updateAboutWhabot/Validation";
// import { updateConfigAppController } from "../../../../../core/updateConfigApp";
// import { updateConfigAppValidation } from "../../../../../core/updateConfigApp/Validation";
// import { updateRootCampaignParameterRangesConfigController } from "../../../../../core/updateRootCampaignParameterRangesConfig";
// import { updateRootCampaignParameterRangesConfigValidation } from "../../../../../core/updateRootCampaignParameterRangesConfig/Validation";
import { updateRootUserController } from "../../../../../core/updateRootUser";
import { updateRootUserValidation } from "../../../../../core/updateRootUser/Validation";
// import { updateAffiliateController } from "../../../../../core/updateAffiliate";
// import { updateAffiliateValidation } from "../../../../../core/updateAffiliate/Validation";
// import { updateCouponValidation } from "../../../../../core/updateCoupon/Validation";
// import { updateCouponController } from "../../../../../core/updateCoupon";
import { updateRootConfigController } from "../../../../../core/updateRootConfig";
import { updateRootConfigValidation } from "../../../../../core/updateRootConfig/Validation";
// import { updatePlanValidation } from "../../../../../core/updatePlan/Validation";
// import { updatePlanController } from "../../../../../core/updatePlan";

const RouterV1Root_Put = Router();

RouterV1Root_Put.put(
  "/data",
  updateRootUserValidation,
  updateRootUserController
);
// const pathOfDestiny = resolve(__dirname, `../../../../../config`);

// RouterV1Root_Put.put(
//   "/config-app",
//   (req: Request<any>, res: Response, next: NextFunction) =>
//     multer({
//       storage: storageMulter({ pathOfDestiny }),
//     }).single("logo")(req, res, next),
//   (req: any, res, next) => {
//     req.body = {
//       rootId: Number(req.headers.authorization),
//       ...(req.file && {
//         fileName: req.file.filename,
//       }),
//       ...req.body,
//     };
//     next();
//   },
//   updateConfigAppValidation,
//   updateConfigAppController
// );

// RouterV1Root_Put.put(
//   "/campaign-parameter-range/:id",
//   updateRootCampaignParameterRangesConfigValidation,
//   updateRootCampaignParameterRangesConfigController
// );

RouterV1Root_Put.put(
  "/help/help-session/:page",
  updateHelpSessionValidation,
  updateHelpSessionController
);

// RouterV1Root_Put.put(
//   "/affiliate/:id",
//   updateAffiliateValidation,
//   updateAffiliateController
// );

// RouterV1Root_Put.put(
//   "/coupon/:id",
//   updateCouponValidation,
//   updateCouponController
// );

RouterV1Root_Put.put(
  "/root-config",
  updateRootConfigValidation,
  updateRootConfigController
);

// RouterV1Root_Put.put("/plan/:id", updatePlanValidation, updatePlanController);

export default RouterV1Root_Put;
