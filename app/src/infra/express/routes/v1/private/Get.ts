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
import { getMenusOnlineValidation } from "../../../../../core/getMenusOnline/Validation";
import { getMenusOnlineController } from "../../../../../core/getMenusOnline";
import { getMenuOnlineValidation } from "../../../../../core/getMenuOnline/Validation";
import { getMenuOnlineController } from "../../../../../core/getMenuOnline";
import { getMenuOnlineItemsValidation } from "../../../../../core/getMenuOnlineItems/Validation";
import { getMenuOnlineItemsController } from "../../../../../core/getMenuOnlineItems";
import { getAppointmentsController } from "../../../../../core/getAppointments";
import { getAppointmentsValidation } from "../../../../../core/getAppointments/Validation";
import { getAppointmentDetailsValidation } from "../../../../../core/getAppointmentDetails/Validation";
import { getAppointmentDetailsController } from "../../../../../core/getAppointmentDetails";
import { getServicesTodayValidation } from "../../../../../core/getServicesToday/Validation";
import { getServicesTodayController } from "../../../../../core/getServicesToday";
import { getAgentTemplatesValidation } from "../../../../../core/getAgentTemplates/Validation";
import { getAgentTemplatesController } from "../../../../../core/getAgentTemplates";
import { getAgentTemplateValidation } from "../../../../../core/getAgentTemplate/Validation";
import { getAgentTemplateController } from "../../../../../core/getAgentTemplate";
import { getMenuOnlineCategoriesForSelectValidation } from "../../../../../core/getMenuOnlineCategoriesForSelect/Validation";
import { getMenuOnlineCategoriesForSelectController } from "../../../../../core/getMenuOnlineCategoriesForSelect";
import { getMenuOnlineSectionsOfItemValidation } from "../../../../../core/getMenuOnlineSectionsOfItem/Validation";
import { getMenuOnlineSectionsOfItemController } from "../../../../../core/getMenuOnlineSectionsOfItem";
import { getMenuOnlineCategoriesValidation } from "../../../../../core/getMenuOnlineCategories/Validation";
import { getMenuOnlineCategoriesController } from "../../../../../core/getMenuOnlineCategories";
import { getMenuOnlineCategoryValidation } from "../../../../../core/getMenuOnlineCategory/Validation";
import { getMenuOnlineCategoryController } from "../../../../../core/getMenuOnlineCategory";
import { getMenuOnlineItemValidation } from "../../../../../core/getMenuOnlineItem/Validation";
import { getMenuOnlineItemController } from "../../../../../core/getMenuOnlineItem";
import { getMenuOnlineItemsForSelectValidation } from "../../../../../core/getMenuOnlineItemsForSelect/Validation";
import { getMenuOnlineItemsForSelectController } from "../../../../../core/getMenuOnlineItemsForSelect";
import { csrfMiddleware } from "../../../../middlewares/csrf";
import { getMenuOnlineSubItemsForSelectValidation } from "../../../../../core/getMenuOnlineSubItemsForSelect/Validation";
import { getMenuOnlineSubItemsForSelectController } from "../../../../../core/getMenuOnlineSubItemsForSelect";
import { getTablesValidation } from "../../../../../core/getTables/Validation";
import { getTablesController } from "../../../../../core/getTables";

const RouterV1Private_Get = Router();

RouterV1Private_Get.get(
  "/connections-wa",
  csrfMiddleware,
  getConnectionsWAValidation,
  getConnectionsWAController,
);

RouterV1Private_Get.get(
  "/connections-wa/options",
  csrfMiddleware,
  getConnectionsWAForSelectValidation,
  getConnectionsWAForSelectController,
);

RouterV1Private_Get.get(
  "/connections-wa/:id/details",
  csrfMiddleware,
  getConnectionWADetailsValidation,
  getConnectionWADetailsController,
);

RouterV1Private_Get.get(
  "/connection-wa/:id",
  csrfMiddleware,
  getConnectionWAValidation,
  getConnectionWAController,
);

RouterV1Private_Get.get("/account", getAccountValidation, getAccountController);

RouterV1Private_Get.get(
  "/tags",
  csrfMiddleware,
  getTagsValidation,
  getTagsController,
);

RouterV1Private_Get.get(
  "/tags/options",
  csrfMiddleware,
  getTagForSelectValidation,
  getTagForSelectController,
);

RouterV1Private_Get.get(
  "/tags/:id",
  csrfMiddleware,
  getTagValidation,
  getTagController,
);

RouterV1Private_Get.get(
  "/tags/:id/details",
  csrfMiddleware,
  getTagDetailsValidation,
  getTagDetailsController,
);

RouterV1Private_Get.get(
  "/variables",
  csrfMiddleware,
  getVariableBusinessValidation,
  getVariableBusinessController,
);

RouterV1Private_Get.get(
  "/variables/options",
  csrfMiddleware,
  getVariableForSelectValidation,
  getVariableForSelectController,
);

RouterV1Private_Get.get(
  "/variables/:id",
  csrfMiddleware,
  getVariableValidation,
  getVariableController,
);

RouterV1Private_Get.get(
  "/variables/:id/details",
  csrfMiddleware,
  getVariableDetailsValidation,
  getVariableDetailsController,
);

RouterV1Private_Get.get(
  "/businesses",
  csrfMiddleware,
  getBusinessValidation,
  getBusinessesController,
);

RouterV1Private_Get.get(
  "/businesses/options",
  csrfMiddleware,
  getBusinessOnAccountForSelectValidation,
  getBusinessOnAccountForSelectController,
);

RouterV1Private_Get.get(
  "/businesses/:id",
  csrfMiddleware,
  getBusinessIdOnAccountValidation,
  getBusinessIdOnAccountController,
);

RouterV1Private_Get.get(
  "/businesses/:id/details",
  csrfMiddleware,
  getBusinessDetailsValidation,
  getBusinessDetailsController,
);

RouterV1Private_Get.get(
  "/flows",
  csrfMiddleware,
  getFlowsValidation,
  getFlowsController,
);

RouterV1Private_Get.get(
  "/flows/:id/data",
  csrfMiddleware,
  getDataFlowIdValidation,
  getDataFlowIdController,
);

RouterV1Private_Get.get(
  "/flows/:id/details",
  csrfMiddleware,
  getFlowDetailsValidation,
  getFlowDetailsController,
);

RouterV1Private_Get.get(
  "/flows/options",
  csrfMiddleware,
  getFlowOnBusinessForSelectValidation,
  getFlowOnBusinessForSelectController,
);

RouterV1Private_Get.get(
  "/flows/:id",
  csrfMiddleware,
  getFlowValidation,
  getFlowController,
);

RouterV1Private_Get.get(
  "/chatbots",
  csrfMiddleware,
  getChabotsValidation,
  getChabotsController,
);

RouterV1Private_Get.get(
  "/chatbots/options",
  csrfMiddleware,
  getChabotsForSelectValidation,
  getChabotsForSelectController,
);

RouterV1Private_Get.get(
  "/chatbots/:id",
  csrfMiddleware,
  getChatbotValidation,
  getChatbotController,
);

RouterV1Private_Get.get(
  "/chatbots/:id/details",
  csrfMiddleware,
  getChatbotDetailsValidation,
  getChatbotDetailsController,
);

RouterV1Private_Get.get(
  "/shooting-speeds",
  csrfMiddleware,
  getShootingSpeedsValidation,
  getShootingSpeedsController,
);

RouterV1Private_Get.get(
  "/campaigns/:id",
  csrfMiddleware,
  getCampaignValidation,
  getCampaignController,
);

RouterV1Private_Get.get(
  "/campaigns",
  csrfMiddleware,
  getCampaignsValidation,
  getCampaignsController,
);

RouterV1Private_Get.get(
  "/campaigns/:id/details",
  csrfMiddleware,
  getCampaignDetailsValidation,
  getCampaignDetailsController,
);

RouterV1Private_Get.get(
  "/storage-files",
  csrfMiddleware,
  getStorageFilesValidation,
  getStorageFilesController,
);

RouterV1Private_Get.get(
  "/storage-files/options",
  csrfMiddleware,
  getStorageFilesForSelectValidation,
  getStorageFilesForSelectController,
);

RouterV1Private_Get.get(
  "/storage-files/:id",
  csrfMiddleware,
  getStorageFileValidation,
  getStorageFileController,
);

RouterV1Private_Get.get(
  "/agents-ai",
  csrfMiddleware,
  getAgentsAIValidation,
  getAgentsAIController,
);

RouterV1Private_Get.get(
  "/agents-ai/options",
  csrfMiddleware,
  getAgentsAIForSelectValidation,
  getAgentsAIForSelectController,
);

RouterV1Private_Get.get(
  "/agents-ai/:id",
  csrfMiddleware,
  getAgentAIValidation,
  getAgentAIController,
);

RouterV1Private_Get.get(
  "/providers/options",
  csrfMiddleware,
  getProvidersForSelectValidation,
  getProvidersForSelectController,
);

RouterV1Private_Get.get(
  "/inbox-users",
  csrfMiddleware,
  getInboxUsersValidation,
  getInboxUsersController,
);

RouterV1Private_Get.get(
  "/inbox-users/options",
  csrfMiddleware,
  getInboxUserForSelectValidation,
  getInboxUserForSelectController,
);

RouterV1Private_Get.get(
  "/inbox-users/:id",
  csrfMiddleware,
  getInboxUserValidation,
  getInboxUserController,
);

RouterV1Private_Get.get(
  "/inbox-departments",
  csrfMiddleware,
  getInboxDepartmentsValidation,
  getInboxDepartmentsController,
);

RouterV1Private_Get.get(
  "/inbox-departments/options",
  csrfMiddleware,
  getInboxDepartmentsForSelectValidation,
  getInboxDepartmentsForSelectController,
);

RouterV1Private_Get.get(
  "/inbox-departments/:id",
  csrfMiddleware,
  getInboxDepartmentValidation,
  getInboxDepartmentController,
);

RouterV1Private_Get.get(
  "/inbox-departments/:id/tickets/count",
  csrfMiddleware,
  getTicketCountValidation,
  getTicketCountController,
);

RouterV1Private_Get.get(
  "/tickets",
  csrfMiddleware,
  getTicketsValidation,
  getTicketsController,
);

RouterV1Private_Get.get(
  "/tickets/:id",
  csrfMiddleware,
  getTicketValidation,
  getTicketController,
);

RouterV1Private_Get.get(
  "/fb-pixels",
  csrfMiddleware,
  getFbPixelsValidation,
  getFbPixelsController,
);

RouterV1Private_Get.get(
  "/fb-pixels/options",
  csrfMiddleware,
  getFbPixelsForSelectValidation,
  getFbPixelsForSelectController,
);

RouterV1Private_Get.get(
  "/fb-pixels/:id",
  csrfMiddleware,
  getFbPixelValidation,
  getFbPixelController,
);

RouterV1Private_Get.get(
  "/integration/payments",
  csrfMiddleware,
  getPaymentIntegrationsValidation,
  getPaymentIntegrationsController,
);

RouterV1Private_Get.get(
  "/integration/trello",
  csrfMiddleware,
  getTrelloIntegrationsValidation,
  getTrelloIntegrationsController,
);

RouterV1Private_Get.get(
  "/integration/payments/options",
  csrfMiddleware,
  getPaymentIntegrationsForSelectValidation,
  getPaymentIntegrationsForSelectController,
);

RouterV1Private_Get.get(
  "/integration/trello/options",
  csrfMiddleware,
  getTrelloIntegrationsForSelectValidation,
  getTrelloIntegrationsForSelectController,
);

RouterV1Private_Get.get(
  "/integration/payments/:id",
  csrfMiddleware,
  getPaymentIntegrationValidation,
  getPaymentIntegrationController,
);

RouterV1Private_Get.get(
  "/integration/trello/:id",
  csrfMiddleware,
  getTrelloIntegrationValidation,
  getTrelloIntegrationController,
);

RouterV1Private_Get.get(
  "/charges",
  csrfMiddleware,
  getChargesValidation,
  getChargesController,
);

RouterV1Private_Get.get(
  "/orders",
  csrfMiddleware,
  getOrdersValidation,
  getOrdersController,
);

RouterV1Private_Get.get(
  "/integration/trello/:id/boards/options",
  csrfMiddleware,
  getBoardsTrelloForSelectValidation,
  getBoardsTrelloForSelectController,
);

RouterV1Private_Get.get(
  "/integration/trello/:id/lists/:boardId/options",
  csrfMiddleware,
  getListsOnBoardTrelloForSelectValidation,
  getListsOnBoardTrelloForSelectController,
);

RouterV1Private_Get.get(
  "/menus-online",
  csrfMiddleware,
  getMenusOnlineValidation,
  getMenusOnlineController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid",
  csrfMiddleware,
  getMenuOnlineValidation,
  getMenuOnlineController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/items",
  csrfMiddleware,
  getMenuOnlineItemsValidation,
  getMenuOnlineItemsController,
);

RouterV1Private_Get.get(
  "/appointments",
  csrfMiddleware,
  getAppointmentsValidation,
  getAppointmentsController,
);

RouterV1Private_Get.get(
  "/appointments/:id/details",
  csrfMiddleware,
  getAppointmentDetailsValidation,
  getAppointmentDetailsController,
);

RouterV1Private_Get.get(
  "/dash/services-today",
  // csrfMiddleware,
  csrfMiddleware,
  getServicesTodayValidation,
  getServicesTodayController,
);

RouterV1Private_Get.get(
  "/template-agents",
  csrfMiddleware,
  getAgentTemplatesValidation,
  getAgentTemplatesController,
);

RouterV1Private_Get.get(
  "/template-agents/:id",
  csrfMiddleware,
  getAgentTemplateValidation,
  getAgentTemplateController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/categories/options",
  csrfMiddleware,
  getMenuOnlineCategoriesForSelectValidation,
  getMenuOnlineCategoriesForSelectController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/subitems/options",
  csrfMiddleware,
  getMenuOnlineSubItemsForSelectValidation,
  getMenuOnlineSubItemsForSelectController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/sections-of/:itemUuid",
  csrfMiddleware,
  getMenuOnlineSectionsOfItemValidation,
  getMenuOnlineSectionsOfItemController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/categories",
  csrfMiddleware,
  getMenuOnlineCategoriesValidation,
  getMenuOnlineCategoriesController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/categories/:catUuid",
  csrfMiddleware,
  getMenuOnlineCategoryValidation,
  getMenuOnlineCategoryController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/items/options",
  csrfMiddleware,
  getMenuOnlineItemsForSelectValidation,
  getMenuOnlineItemsForSelectController,
);

RouterV1Private_Get.get(
  "/menus-online/:uuid/items/:itemUuid",
  csrfMiddleware,
  getMenuOnlineItemValidation,
  getMenuOnlineItemController,
);

RouterV1Private_Get.get(
  "/tables",
  csrfMiddleware,
  getTablesValidation,
  getTablesController,
);

export default RouterV1Private_Get;
