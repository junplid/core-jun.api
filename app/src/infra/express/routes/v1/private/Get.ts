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
import { getAgentsAIValidation } from "../../../../../core/getAgentsAI/Validation";
import { getAgentsAIController } from "../../../../../core/getAgentsAI";
import { getAgentAIValidation } from "../../../../../core/getAgentAI/Validation";
import { getAgentAIController } from "../../../../../core/getAgentAI";
import { getProvidersForSelectValidation } from "../../../../../core/getProvidersForSelect/Validation";
import { getProvidersForSelectController } from "../../../../../core/getProvidersForSelect";
import { getAgentsAIForSelectValidation } from "../../../../../core/getAgentsAIForSelect/Validation";
import { getAgentsAIForSelectController } from "../../../../../core/getAgentsAIForSelect";
import { getInboxUsersValidation } from "../../../../../core/getInboxUsers/Validation";
import { getInboxUsersController } from "../../../../../core/getInboxUsers";
import { getInboxUserValidation } from "../../../../../core/getInboxUser/Validation";
import { getInboxUserController } from "../../../../../core/getInboxUser";
import { getInboxUserForSelectValidation } from "../../../../../core/getInboxUsersForSelect/Validation";
import { getInboxUserForSelectController } from "../../../../../core/getInboxUsersForSelect";
import { getInboxDepartmentValidation } from "../../../../../core/getInboxDepartment/Validation";
import { getInboxDepartmentController } from "../../../../../core/getInboxDepartment";
import { getInboxDepartmentsValidation } from "../../../../../core/getInboxDepartments/Validation";
import { getInboxDepartmentsController } from "../../../../../core/getInboxDepartments";
import { getInboxDepartmentsForSelectValidation } from "../../../../../core/getInboxDepartmentsForSelect/Validation";
import { getInboxDepartmentsForSelectController } from "../../../../../core/getInboxDepartmentsForSelect";
import { getTicketsValidation } from "../../../../../core/getTickets/Validation";
import { getTicketsController } from "../../../../../core/getTickets";
import { getTicketController } from "../../../../../core/getTicket";
import { getTicketValidation } from "../../../../../core/getTicket/Validation";
import { getTicketCountValidation } from "../../../../../core/getTicketCount/Validation";
import { getTicketCountController } from "../../../../../core/getTicketCount";
import { getFbPixelValidation } from "../../../../../core/getFbPixel/Validation";
import { getFbPixelController } from "../../../../../core/getFbPixel";
import { getFbPixelsController } from "../../../../../core/getFbPixels";
import { getFbPixelsValidation } from "../../../../../core/getFbPixels/Validation";
import { getFbPixelsForSelectValidation } from "../../../../../core/getFbPixelsForSelect/Validation";
import { getFbPixelsForSelectController } from "../../../../../core/getFbPixelsForSelect";
import { getPaymentIntegrationsForSelectValidation } from "../../../../../core/getPaymentIntegrationsForSelect/Validation";
import { getPaymentIntegrationsForSelectController } from "../../../../../core/getPaymentIntegrationsForSelect";
import { getPaymentIntegrationsValidation } from "../../../../../core/getPaymentIntegrations/Validation";
import { getPaymentIntegrationsController } from "../../../../../core/getPaymentIntegrations";
import { getPaymentIntegrationValidation } from "../../../../../core/getPaymentIntegration/Validation";
import { getPaymentIntegrationController } from "../../../../../core/getPaymentIntegration";
import { getChargesValidation } from "../../../../../core/getCharges/Validation";
import { getChargesController } from "../../../../../core/getCharges";
import { getOrdersValidation } from "../../../../../core/getOrders/Validation";
import { getOrdersController } from "../../../../../core/getOrders";
import { getTrelloIntegrationValidation } from "../../../../../core/getTrelloIntegration/Validation";
import { getTrelloIntegrationController } from "../../../../../core/getTrelloIntegration";
import { getTrelloIntegrationsValidation } from "../../../../../core/getTrelloIntegrations/Validation";
import { getTrelloIntegrationsController } from "../../../../../core/getTrelloIntegrations";
import { getTrelloIntegrationsForSelectValidation } from "../../../../../core/getTrelloIntegrationsForSelect/Validation";
import { getTrelloIntegrationsForSelectController } from "../../../../../core/getTrelloIntegrationsForSelect";
import { getBoardsTrelloForSelectValidation } from "../../../../../core/getBoardsTrelloForSelect/Validation";
import { getBoardsTrelloForSelectController } from "../../../../../core/getBoardsTrelloForSelect";
import { getListsOnBoardTrelloForSelectValidation } from "../../../../../core/getListsOnBoardTrelloForSelect/Validation";
import { getListsOnBoardTrelloForSelectController } from "../../../../../core/getListsOnBoardTrelloForSelect";

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

RouterV1Private_Get.get(
  "/agents-ai",
  getAgentsAIValidation,
  getAgentsAIController
);

RouterV1Private_Get.get(
  "/agents-ai/options",
  getAgentsAIForSelectValidation,
  getAgentsAIForSelectController
);

RouterV1Private_Get.get(
  "/agents-ai/:id",
  getAgentAIValidation,
  getAgentAIController
);

RouterV1Private_Get.get(
  "/providers/options",
  getProvidersForSelectValidation,
  getProvidersForSelectController
);

RouterV1Private_Get.get(
  "/inbox-users",
  getInboxUsersValidation,
  getInboxUsersController
);

RouterV1Private_Get.get(
  "/inbox-users/options",
  getInboxUserForSelectValidation,
  getInboxUserForSelectController
);

RouterV1Private_Get.get(
  "/inbox-users/:id",
  getInboxUserValidation,
  getInboxUserController
);

RouterV1Private_Get.get(
  "/inbox-departments",
  getInboxDepartmentsValidation,
  getInboxDepartmentsController
);

RouterV1Private_Get.get(
  "/inbox-departments/options",
  getInboxDepartmentsForSelectValidation,
  getInboxDepartmentsForSelectController
);

RouterV1Private_Get.get(
  "/inbox-departments/:id",
  getInboxDepartmentValidation,
  getInboxDepartmentController
);

RouterV1Private_Get.get(
  "/inbox-departments/:id/tickets/count",
  getTicketCountValidation,
  getTicketCountController
);

RouterV1Private_Get.get("/tickets", getTicketsValidation, getTicketsController);

RouterV1Private_Get.get(
  "/tickets/:id",
  getTicketValidation,
  getTicketController
);

RouterV1Private_Get.get(
  "/fb-pixels",
  getFbPixelsValidation,
  getFbPixelsController
);

RouterV1Private_Get.get(
  "/fb-pixels/options",
  getFbPixelsForSelectValidation,
  getFbPixelsForSelectController
);

RouterV1Private_Get.get(
  "/fb-pixels/:id",
  getFbPixelValidation,
  getFbPixelController
);

RouterV1Private_Get.get(
  "/integration/payments",
  getPaymentIntegrationsValidation,
  getPaymentIntegrationsController
);

RouterV1Private_Get.get(
  "/integration/trello",
  getTrelloIntegrationsValidation,
  getTrelloIntegrationsController
);

RouterV1Private_Get.get(
  "/integration/payments/options",
  getPaymentIntegrationsForSelectValidation,
  getPaymentIntegrationsForSelectController
);

RouterV1Private_Get.get(
  "/integration/trello/options",
  getTrelloIntegrationsForSelectValidation,
  getTrelloIntegrationsForSelectController
);

RouterV1Private_Get.get(
  "/integration/payments/:id",
  getPaymentIntegrationValidation,
  getPaymentIntegrationController
);

RouterV1Private_Get.get(
  "/integration/trello/:id",
  getTrelloIntegrationValidation,
  getTrelloIntegrationController
);

RouterV1Private_Get.get("/charges", getChargesValidation, getChargesController);

RouterV1Private_Get.get("/orders", getOrdersValidation, getOrdersController);

RouterV1Private_Get.get(
  "/integration/trello/:id/boards/options",
  getBoardsTrelloForSelectValidation,
  getBoardsTrelloForSelectController
);

RouterV1Private_Get.get(
  "/integration/trello/:id/lists/:boardId/options",
  getListsOnBoardTrelloForSelectValidation,
  getListsOnBoardTrelloForSelectController
);

export default RouterV1Private_Get;
