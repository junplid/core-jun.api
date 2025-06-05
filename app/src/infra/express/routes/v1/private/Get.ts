import { Router } from "express";
import { getAccountController } from "../../../../../core/getAccount";
import { getAccountValidation } from "../../../../../core/getAccount/Validation";
import { getBusinessIdOnAccountController } from "../../../../../core/getBusiness";
import { getBusinessIdOnAccountValidation } from "../../../../../core/getBusiness/Validation";
import { getBusinessesController } from "../../../../../core/getBusinesses";
import { getBusinessValidation } from "../../../../../core/getBusinesses/Validation";
import { getBusinessOnAccountForSelectController } from "../../../../../core/getBusinessOnAccountForSelect";
import { getBusinessOnAccountForSelectValidation } from "../../../../../core/getBusinessOnAccountForSelect/Validation";
import { getChabotsController } from "../../../../../core/getChatbots";
import { getChabotsValidation } from "../../../../../core/getChatbots/Validation";
import { getChabotsForSelectController } from "../../../../../core/getChatbotsForSelect";
import { getChabotsForSelectValidation } from "../../../../../core/getChatbotsForSelect/Validation";
import { getConnectionWADetailsController } from "../../../../../core/getConnectionWADetails";
import { getConnectionWADetailsValidation } from "../../../../../core/getConnectionWADetails/Validation";
import { getConnectionsWAForSelectController } from "../../../../../core/getConnectionsWAForSelect";
import { getConnectionsWAForSelectValidation } from "../../../../../core/getConnectionsWAForSelect/Validation";
import { getConnectionsWAController } from "../../../../../core/getConnectionsWA";
import { getConnectionsWAValidation } from "../../../../../core/getConnectionsWA/Validation";
import { getDataFlowIdController } from "../../../../../core/getDataFlowId";
import { getDataFlowIdValidation } from "../../../../../core/getDataFlowId/Validation";
import { getConnectionWAController } from "../../../../../core/getConnectionWA";
import { getConnectionWAValidation } from "../../../../../core/getConnectionWA/Validation";
import { getFlowOnBusinessForSelectController } from "../../../../../core/getFlowOnBusinessForSelect";
import { getFlowOnBusinessForSelectValidation } from "../../../../../core/getFlowOnBusinessForSelect/Validation";
import { getFlowsController } from "../../../../../core/getFlows";
import { getFlowsValidation } from "../../../../../core/getFlows/Validation";
import { getTagsController } from "../../../../../core/getTags";
import { getTagsValidation } from "../../../../../core/getTags/Validation";
import { getTagForSelectController } from "../../../../../core/getTagForSelect";
import { getTagForSelectValidation } from "../../../../../core/getTagForSelect/Validation";
import { getVariableForSelectController } from "../../../../../core/getVariableForSelect";
import { getVariableForSelectValidation } from "../../../../../core/getVariableForSelect/Validation";
import { getVariableBusinessController } from "../../../../../core/getVariables";
import { getVariableBusinessValidation } from "../../../../../core/getVariables/Validation";
import { getFlowController } from "../../../../../core/getFlow";
import { getFlowValidation } from "../../../../../core/getFlow/Validation";
import { getFlowDetailsValidation } from "../../../../../core/getFlowDetails/Validation";
import { getFlowDetailsController } from "../../../../../core/getFlowDetails";
import { getTagValidation } from "../../../../../core/getTag/Validation";
import { getTagController } from "../../../../../core/getTag";
import { getTagDetailsValidation } from "../../../../../core/getTagDetails/Validation";
import { getTagDetailsController } from "../../../../../core/getTagDetails";
import { getVariableValidation } from "../../../../../core/getVariable/Validation";
import { getVariableController } from "../../../../../core/getVariable";
import { getVariableDetailsValidation } from "../../../../../core/getVariableDetails/Validation";
import { getVariableDetailsController } from "../../../../../core/getVariableDetails";
import { getChatbotValidation } from "../../../../../core/getChatbot/Validation";
import { getChatbotController } from "../../../../../core/getChatbot";
import { getChatbotDetailsValidation } from "../../../../../core/getChatbotDetails/Validation";
import { getChatbotDetailsController } from "../../../../../core/getChatbotDetails";
import { getBusinessDetailsValidation } from "../../../../../core/getBusinessDetails/Validation";
import { getBusinessDetailsController } from "../../../../../core/getBusinessDetails";
import { getShootingSpeedsValidation } from "../../../../../core/getShootingSpeeds/Validation";
import { getShootingSpeedsController } from "../../../../../core/getShootingSpeeds";
import { getCampaignDetailsValidation } from "../../../../../core/getCampaignDetails/Validation";
import { getCampaignDetailsController } from "../../../../../core/getCampaignDetails";
import { getCampaignValidation } from "../../../../../core/getCampaign/Validation";
import { getCampaignController } from "../../../../../core/getCampaign";
import { getCampaignsValidation } from "../../../../../core/getCampaigns/Validation";
import { getCampaignsController } from "../../../../../core/getCampaigns";
import { getStorageFilesValidation } from "../../../../../core/getStorageFiles/Validation";
import { getStorageFilesController } from "../../../../../core/getStorageFiles";
import { getStorageFileValidation } from "../../../../../core/getStorageFile/Validation";
import { getStorageFileController } from "../../../../../core/getStorageFile";
import { getStorageFilesForSelectValidation } from "../../../../../core/getStorageFilesForSelect/Validation";
import { getStorageFilesForSelectController } from "../../../../../core/getStorageFilesForSelect";

const RouterV1Private_Get = Router();

RouterV1Private_Get.get(
  "/connections-wa",
  getConnectionsWAValidation,
  getConnectionsWAController
);

RouterV1Private_Get.get(
  "/connections-wa/options",
  getConnectionsWAForSelectValidation,
  getConnectionsWAForSelectController
);

RouterV1Private_Get.get(
  "/connections-wa/:id/details",
  getConnectionWADetailsValidation,
  getConnectionWADetailsController
);

RouterV1Private_Get.get(
  "/connection-wa/:id",
  getConnectionWAValidation,
  getConnectionWAController
);

RouterV1Private_Get.get("/account", getAccountValidation, getAccountController);

RouterV1Private_Get.get("/tags", getTagsValidation, getTagsController);

RouterV1Private_Get.get(
  "/tags/options",
  getTagForSelectValidation,
  getTagForSelectController
);

RouterV1Private_Get.get("/tags/:id", getTagValidation, getTagController);

RouterV1Private_Get.get(
  "/tags/:id/details",
  getTagDetailsValidation,
  getTagDetailsController
);

RouterV1Private_Get.get(
  "/variables",
  getVariableBusinessValidation,
  getVariableBusinessController
);

RouterV1Private_Get.get(
  "/variables/options",
  getVariableForSelectValidation,
  getVariableForSelectController
);

RouterV1Private_Get.get(
  "/variables/:id",
  getVariableValidation,
  getVariableController
);

RouterV1Private_Get.get(
  "/variables/:id/details",
  getVariableDetailsValidation,
  getVariableDetailsController
);

RouterV1Private_Get.get(
  "/businesses",
  getBusinessValidation,
  getBusinessesController
);

RouterV1Private_Get.get(
  "/businesses/options",
  getBusinessOnAccountForSelectValidation,
  getBusinessOnAccountForSelectController
);

RouterV1Private_Get.get(
  "/businesses/:id",
  getBusinessIdOnAccountValidation,
  getBusinessIdOnAccountController
);

RouterV1Private_Get.get(
  "/businesses/:id/details",
  getBusinessDetailsValidation,
  getBusinessDetailsController
);

RouterV1Private_Get.get("/flows", getFlowsValidation, getFlowsController);

RouterV1Private_Get.get(
  "/flows/:id/data",
  getDataFlowIdValidation,
  getDataFlowIdController
);

RouterV1Private_Get.get(
  "/flows/:id/details",
  getFlowDetailsValidation,
  getFlowDetailsController
);

RouterV1Private_Get.get(
  "/flows/options",
  getFlowOnBusinessForSelectValidation,
  getFlowOnBusinessForSelectController
);

RouterV1Private_Get.get("/flows/:id", getFlowValidation, getFlowController);

RouterV1Private_Get.get(
  "/chatbots",
  getChabotsValidation,
  getChabotsController
);

RouterV1Private_Get.get(
  "/chatbots/options",
  getChabotsForSelectValidation,
  getChabotsForSelectController
);

RouterV1Private_Get.get(
  "/chatbots/:id",
  getChatbotValidation,
  getChatbotController
);

RouterV1Private_Get.get(
  "/chatbots/:id/details",
  getChatbotDetailsValidation,
  getChatbotDetailsController
);

RouterV1Private_Get.get(
  "/shooting-speeds",
  getShootingSpeedsValidation,
  getShootingSpeedsController
);

RouterV1Private_Get.get(
  "/campaigns/:id",
  getCampaignValidation,
  getCampaignController
);

RouterV1Private_Get.get(
  "/campaigns",
  getCampaignsValidation,
  getCampaignsController
);

RouterV1Private_Get.get(
  "/campaigns/:id/details",
  getCampaignDetailsValidation,
  getCampaignDetailsController
);

RouterV1Private_Get.get(
  "/storage-files",
  getStorageFilesValidation,
  getStorageFilesController
);

RouterV1Private_Get.get(
  "/storage-files/options",
  getStorageFilesForSelectValidation,
  getStorageFilesForSelectController
);

RouterV1Private_Get.get(
  "/storage-files/:id",
  getStorageFileValidation,
  getStorageFileController
);

export default RouterV1Private_Get;
