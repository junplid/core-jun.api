import { Router } from "express";
import { getAccountController } from "../../../../../core/getAccount";
import { getAccountValidation } from "../../../../../core/getAccount/Validation";
// import { getAudienceOnAccountForSelectController } from "../../../../../core/getAudienceOnAccountForSelect";
// import { getAudienceOnAccountForSelectValidation } from "../../../../../core/getAudienceOnAccountForSelect/Validation";
// import { getAuthorizationAccountController } from "../../../../../core/getAuthorizationAccount";
// import { getAuthorizationAccountValidation } from "../../../../../core/getAuthorizationAccount/Validation";
// import { getBoardsTrelloForSelectController } from "../../../../../core/getBoardsTrelloForSelect";
// import { getBoardsTrelloForSelectValidation } from "../../../../../core/getBoardsTrelloForSelect/Validation";
import { getBusinessIdOnAccountController } from "../../../../../core/getBusiness";
import { getBusinessIdOnAccountValidation } from "../../../../../core/getBusiness/Validation";
import { getBusinessesController } from "../../../../../core/getBusinesses";
import { getBusinessValidation } from "../../../../../core/getBusinesses/Validation";
import { getBusinessOnAccountForSelectController } from "../../../../../core/getBusinessOnAccountForSelect";
import { getBusinessOnAccountForSelectValidation } from "../../../../../core/getBusinessOnAccountForSelect/Validation";
// import { getCampaignsController } from "../../../../../core/getCampaigns";
// import { getCampaignsValidation } from "../../../../../core/getCampaigns/Validation";
// import { getCampaignAudiencesController } from "../../../../../core/getCampaignAudiences";
// import { getCampaignAudiencesValidation } from "../../../../../core/getCampaignAudiences/Validation";
// import { getCampaignAudienceForSelectController } from "../../../../../core/getCampaignAudienceForSelect";
// import { getCampaignAudienceForSelectValidation } from "../../../../../core/getCampaignAudienceForSelect/Validation";
// import { getCampaignOnAccountForSelectController } from "../../../../../core/getCampaignOnAccountForSelect";
// import { getCampaignOnAccountForSelectValidation } from "../../../../../core/getCampaignOnAccountForSelect/Validation";
// import { getCampaignParameterController } from "../../../../../core/getCampaignParameter";
// import { getCampaignParameterValidation } from "../../../../../core/getCampaignParameter/Validation";
// import { getCampaignParameterIdController } from "../../../../../core/getCampaignParameterId";
// import { getCampaignParameterIdValidation } from "../../../../../core/getCampaignParameterId/Validation";
// import { getCampaignParameterRangesController } from "../../../../../core/getCampaignParameterRanges";
// import { getCampaignParameterRangesValidation } from "../../../../../core/getCampaignParameterRanges/Validation";
import { getChabotsController } from "../../../../../core/getChatbots";
import { getChabotsValidation } from "../../../../../core/getChatbots/Validation";
import { getChabotsForSelectController } from "../../../../../core/getChatbotsForSelect";
import { getChabotsForSelectValidation } from "../../../../../core/getChatbotsForSelect/Validation";
// import { getCheckPointsController } from "../../../../../core/getCheckPoints";
// import { getCheckPointsValidation } from "../../../../../core/getCheckPoints/Validation";
// import { getCheckPointsForSelectController } from "../../../../../core/getCheckPointsForSelect";
// import { getCheckPointsForSelectValidation } from "../../../../../core/getCheckPointsForSelect/Validation";
import { getConnectionWADetailsController } from "../../../../../core/getConnectionWADetails";
import { getConnectionWADetailsValidation } from "../../../../../core/getConnectionWADetails/Validation";
import { getConnectionsWAForSelectController } from "../../../../../core/getConnectionsWAForSelect";
import { getConnectionsWAForSelectValidation } from "../../../../../core/getConnectionsWAForSelect/Validation";
import { getConnectionsWAController } from "../../../../../core/getConnectionsWA";
import { getConnectionsWAValidation } from "../../../../../core/getConnectionsWA/Validation";
import { getContactWAOnAccountController } from "../../../../../core/getContactWAOnAccount";
import { getContactWAOnAccountValidation } from "../../../../../core/getContactWAOnAccount/Validation";
import { getDataDashboardController } from "../../../../../core/getDataDashboard";
import { getDataDashboardValidation } from "../../../../../core/getDataDashboard/Validation";
import { getDataFlowIdController } from "../../../../../core/getDataFlowId";
import { getDataFlowIdValidation } from "../../../../../core/getDataFlowId/Validation";
// import { getEmailsServicesConfigurationController } from "../../../../../core/getEmailsServicesConfiguration";
// import { getEmailsServicesConfigurationValidation } from "../../../../../core/getEmailsServicesConfiguration/Validation";
// import { getEmailServiceConfigurationForSelectController } from "../../../../../core/getEmailServiceConfigurationForSelect";
// import { getEmailServiceConfigurationForSelectValidation } from "../../../../../core/getEmailServiceConfigurationForSelect/Validation";
// import { getExtraPackageController } from "../../../../../core/getExtraPackage";
// import { getExtraPackageValidation } from "../../../../../core/getExtraPackage/Validation";
// import { getExtraPackagesController } from "../../../../../core/getExtraPackages";
// import { getExtraPackagesValidation } from "../../../../../core/getExtraPackages/Validation";
import { getConnectionWAController } from "../../../../../core/getConnectionWA";
import { getConnectionWAValidation } from "../../../../../core/getConnectionWA/Validation";
import { getFlowOnBusinessForSelectController } from "../../../../../core/getFlowOnBusinessForSelect";
import { getFlowOnBusinessForSelectValidation } from "../../../../../core/getFlowOnBusinessForSelect/Validation";
import { getFlowsController } from "../../../../../core/getFlows";
import { getFlowsValidation } from "../../../../../core/getFlows/Validation";
// import { getFunnelKanbansController } from "../../../../../core/getFunnelKanbans";
// import { getFunnelKanbansValidation } from "../../../../../core/getFunnelKanbans/Validation";
// import { getIntegrationsController } from "../../../../../core/getIntegrations";
// import { getIntegrationsValidation } from "../../../../../core/getIntegrations/Validation";
// import { getIntegrationsForSelectController } from "../../../../../core/getIntegrationsForSelect";
// import { getIntegrationsForSelectValidation } from "../../../../../core/getIntegrationsForSelect/Validation";
// import { geKanbanColumnForSelectFlowController } from "../../../../../core/getKanbanColumnForSelectFlow";
// import { geKanbanColumnForSelectFlowValidation } from "../../../../../core/getKanbanColumnForSelectFlow/Validation";
// import { geKanbanForSelectController } from "../../../../../core/getKanbanForSelect2";
// import { geKanbanForSelectValidation } from "../../../../../core/getKanbanForSelect2/Validation";
// import { getLinksTrackingPixelController } from "../../../../../core/getLinksTrackingPixel";
// import { getLinksTrackingPixelValidation } from "../../../../../core/getLinksTrackingPixel/Validation";
// import { getLinkTrackingPixelForSelectController } from "../../../../../core/getLinkTrackingPixelForSelect";
// import { getLinkTrackingPixelForSelectValidation } from "../../../../../core/getLinkTrackingPixelForSelect/Validation";
// import { getListOfBoardTrelloForSelectController } from "../../../../../core/getListOfBoardTrelloForSelect";
// import { getListOfBoardTrelloForSelectValidation } from "../../../../../core/getListOfBoardTrelloForSelect/Validation";
// import { getParametersOnAccountForSelectController } from "../../../../../core/getParametersOnAccountForSelect";
// import { getParametersOnAccountForSelectValidation } from "../../../../../core/getParametersOnAccountForSelect/Validation";
// import { getPeriodsPlanPublicController } from "../../../../../core/getPeriodsPlanPublic";
// import { getPeriodsPlanPublicValidation } from "../../../../../core/getPeriodsPlanPublic/Validation";
// import { getPlanController } from "../../../../../core/getPlan";
// import { getPlanValidation } from "../../../../../core/getPlan/Validation";
// import { getPlansController } from "../../../../../core/getPlans";
// import { getSectorsController } from "../../../../../core/getSectors";
// import { getSectorsValidation } from "../../../../../core/getSectors/Validation";
// import { getSectorsAttendantsController } from "../../../../../core/getSectorsAttendants";
// import { getSectorsAttendantsValidation } from "../../../../../core/getSectorsAttendants/Validation";
// import { getSectorsAttendantsForSelectController } from "../../../../../core/getSectorsAttendantsForSelect";
// import { getSectorsAttendantsForSelectValidation } from "../../../../../core/getSectorsAttendantsForSelect/Validation";
// import { getSectorsForSelectController } from "../../../../../core/getSectorsForSelect";
// import { getSectorsForSelectValidation } from "../../../../../core/getSectorsForSelect/Validation";
// import { getStaticFileController } from "../../../../../core/getStaticFile";
// import { getStaticFileValidation } from "../../../../../core/getStaticFile/Validation";
import { getStatusSessionWhatsappPublicController } from "../../../../../core/getStatusSessionWhatsappPublic";
import { getStatusSessionWhatsappPublicValidation } from "../../../../../core/getStatusSessionWhatsappPublic/Validation";
// import { getSubAccountController } from "../../../../../core/getSubAccount";
// import { getSubAccountValidation } from "../../../../../core/getSubAccount/Validation";
// import { getSupervisorsController } from "../../../../../core/getSupervisors";
// import { getSupervisorsValidation } from "../../../../../core/getSupervisors/Validation";
// import { geSupervisorsForSelectController } from "../../../../../core/getSupervisorsForSelect";
// import { geSupervisorsForSelectValidation } from "../../../../../core/getSupervisorsForSelect/Validation";
import { getTagsController } from "../../../../../core/getTags";
import { getTagsValidation } from "../../../../../core/getTags/Validation";
import { getTagForSelectController } from "../../../../../core/getTagForSelect";
import { getTagForSelectValidation } from "../../../../../core/getTagForSelect/Validation";
import { getVariableForSelectController } from "../../../../../core/getVariableForSelect";
import { getVariableForSelectValidation } from "../../../../../core/getVariableForSelect/Validation";
import { getVariableBusinessController } from "../../../../../core/getVariables";
import { getVariableBusinessValidation } from "../../../../../core/getVariables/Validation";
// import { getCreditCardValidation } from "../../../../../core/getCreditCards/Validation";
// import { getCreditCardController } from "../../../../../core/getCreditCards";
import { getMyAccountController } from "../../../../../core/getMyAccount";
import { getMyAccountValidation } from "../../../../../core/getMyAccount/Validation";
// import { getDiscountCoupomValidation } from "../../../../../core/getDiscountCoupom/Validation";
// import { getDiscountCoupomController } from "../../../../../core/getDiscountCoupom";
// import { getPlansValidation } from "../../../../../core/getPlans/Validation";
// import { getSubscriptionsADMValidation } from "../../../../../core/getSubscriptionsADM/Validation";
// import { getSubscriptionsADMController } from "../../../../../core/getSubscriptionsADM";
// import { getPaymentsSubscriptionsADMController } from "../../../../../core/getPaymentsSubscriptionADM";
// import { getPaymentsSubscriptionsADMValidation } from "../../../../../core/getPaymentsSubscriptionADM/Validation";
// import { getPaymentsADMValidation } from "../../../../../core/getPaymentsADM/Validation";
// import { getPaymentsADMController } from "../../../../../core/getPaymentsADM";
// import { getFunnelKanbanADMValidation } from "../../../../../core/getFunnelKanbanADM/Validation";
// import { getFunnelKanbanADMController } from "../../../../../core/getFunnelKanbanADM";
// import { getSupervisorValidation } from "../../../../../core/getSupervisor/Validation";
// import { getSupervisorController } from "../../../../../core/getSupervisor";
// import { getSupervisorDetailsValidation } from "../../../../../core/getSupervisorDetails/Validation";
// import { getSupervisorDetailsController } from "../../../../../core/getSupervisorDetails";
// import { getSectorsAttendantValidation } from "../../../../../core/getSectorsAttendant/Validation";
// import { getSectorsAttendantController } from "../../../../../core/getSectorsAttendant";
// import { getSectorsAttendantDetailsController } from "../../../../../core/getSectorsAttendantDetails";
// import { getSectorsAttendantDetailsValidation } from "../../../../../core/getSectorsAttendantDetails/Validation";
// import { getSectorValidation } from "../../../../../core/getSector/Validation";
// import { getSectorController } from "../../../../../core/getSector";
// import { getSectorDetailsValidation } from "../../../../../core/getSectorDetails/Validation";
// import { getSectorDetailsController } from "../../../../../core/getSectorDetails";
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
// import { getCheckpointValidation } from "../../../../../core/getCheckpoint/Validation";
// import { getCheckpointController } from "../../../../../core/getCheckpoint";
// import { getCheckpointDetailsValidation } from "../../../../../core/getCheckpointDetails/Validation";
// import { getCheckpointDetailsController } from "../../../../../core/getCheckpointDetails";
// import { getLinkTrackingPixelValidation } from "../../../../../core/getLinkTrackingPixel/Validation";
// import { getLinkTrackingPixelController } from "../../../../../core/getLinkTrackingPixel";
// import { getLinkTrackingPixelDetailsValidation } from "../../../../../core/getLinkTrackingPixelDetails/Validation";
// import { getLinkTrackingPixelDetailsController } from "../../../../../core/getLinkTrackingPixelDetails";
// import { getCampaignAudienceValidation } from "../../../../../core/getCampaignAudience/Validation";
// import { getCampaignAudienceController } from "../../../../../core/getCampaignAudience";
// import { getCampaignAudienceDetailsValidation } from "../../../../../core/getCampaignAudienceDetails/Validation";
// import { getCampaignAudienceDetailsController } from "../../../../../core/getCampaignAudienceDetails";
// import { getCampaignParameterDetailsValidation } from "../../../../../core/getCampaignParameterDetails/Validation";
// import { getCampaignParameterDetailsController } from "../../../../../core/getCampaignParameterDetails";
// import { getCampaignOndemandValidation } from "../../../../../core/getCampaignOndemand/Validation";
// import { getCampaignOndemandController } from "../../../../../core/getCampaignOndemand";
// import { getCampaignOndemandDetailsValidation } from "../../../../../core/getCampaignOndemandDetails/Validation";
// import { getCampaignOndemandDetailsController } from "../../../../../core/getCampaignOndemandDetails";
// import { getCampaignValidation } from "../../../../../core/getCampaign/Validation";
// import { getCampaignController } from "../../../../../core/getCampaign";
// import { getCampaignDetailsValidation } from "../../../../../core/getCampaignDetails/Validation";
// import { getCampaignDetailsController } from "../../../../../core/getCampaignDetails";
import { getChatbotValidation } from "../../../../../core/getChatbot/Validation";
import { getChatbotController } from "../../../../../core/getChatbot";
import { getChatbotDetailsValidation } from "../../../../../core/getChatbotDetails/Validation";
import { getChatbotDetailsController } from "../../../../../core/getChatbotDetails";
// import { getGeolocationsValidation } from "../../../../../core/getGeolocations/Validation";
// import { getGeolocationsController } from "../../../../../core/getGeolocations";
// import { getGeolocationValidation } from "../../../../../core/getGeolocation/Validation";
// import { getGeolocationController } from "../../../../../core/getGeolocation";
// import { getGeolocationDetailsValidation } from "../../../../../core/getGeolocationDetails/Validation";
// import { getGeolocationDetailsController } from "../../../../../core/getGeolocationDetails";
// import { getGeolocationForSelectValidation } from "../../../../../core/getGeolocationsForSelect/Validation";
// import { getGeolocationForSelectController } from "../../../../../core/getGeolocationsForSelect";
// import { getEmailServiceConfigurationDetailsValidation } from "../../../../../core/getEmailServiceConfigurationDetails/Validation";
// import { getEmailServiceConfigurationDetailsController } from "../../../../../core/getEmailServiceConfigurationDetails";
// import { getEmailServiceConfigurationValidation } from "../../../../../core/getEmailServiceConfiguration/Validation";
// import { getEmailServiceConfigurationController } from "../../../../../core/getEmailServiceConfiguration";
// import { getSubAccountsValidation } from "../../../../../core/getSubAccounts/Validation";
// import { getSubAccountsController } from "../../../../../core/getSubAccounts";
// import { getSubAccountDetailsValidation } from "../../../../../core/getSubAccountDetails/Validation";
// import { getSubAccountDetailsController } from "../../../../../core/getSubAccountDetails";
// import { getIntegrationDetailsController } from "../../../../../core/getIntegrationDetails";
// import { getIntegrationDetailsValidation } from "../../../../../core/getIntegrationDetails/Validation";
// import { getIntegrationValidation } from "../../../../../core/getIntegration/Validation";
// import { getIntegrationController } from "../../../../../core/getIntegration";
// import { getFileCampaignAudienceValidation } from "../../../../../core/getFileCampaignAudience/Validation";
// import { getFileCampaignAudienceController } from "../../../../../core/getFileCampaignAudience";
// import { getLinkFileCampaignAudienceValidation } from "../../../../../core/getLinkFileCampaignAudience/Validation";
// import { getLinkFileCampaignAudienceController } from "../../../../../core/getLinkFileCampaignAudience";
// import { getIntegrationAiForSelectValidation } from "../../../../../core/getIntegrationAiForSelect/Validation";
// import { getIntegrationAiForSelectController } from "../../../../../core/getIntegrationAiForSelect";
// import { getIntegrationAiValidation } from "../../../../../core/getIntegrationAi/Validation";
// import { getIntegrationAiController } from "../../../../../core/getIntegrationAi";
// import { getIntegrationsAiValidation } from "../../../../../core/getIntegrationsAi/Validation";
// import { getIntegrationsAiController } from "../../../../../core/getIntegrationsAi";
// import { getIntegrationAiDetailsValidation } from "../../../../../core/getIntegrationAiDetails/Validation";
// import { getIntegrationAiDetailsController } from "../../../../../core/getIntegrationAiDetails";
// import { getAttendantAiController } from "../../../../../core/getAtendantAi";
// import { getAttendantAiValidation } from "../../../../../core/getAtendantAi/Validation";
// import { getAttendantAiForSelectValidation } from "../../../../../core/getAttendantAiForSelect/Validation";
// import { getAttendantAiForSelectController } from "../../../../../core/getAttendantAiForSelect";
// import { getAttendantsAiValidation } from "../../../../../core/getAttendantsAi/Validation";
// import { getAttendantsAiController } from "../../../../../core/getAttendantsAi";
// import { getAttendantAiDetailsValidation } from "../../../../../core/getAttendantAiDetails/Validation";
// import { getAttendantAiDetailsController } from "../../../../../core/getAttendantAiDetails";
// import { getBusinessFacebookIntegrationForSelectValidation } from "../../../../../core/getBusinessFacebookIntegrationForSelect/Validation";
// import { getBusinessFacebookIntegrationForSelectController } from "../../../../../core/getBusinessFacebookIntegrationForSelect";
// import { getPixelsFacebookIntegrationForSelectValidation } from "../../../../../core/getPixelsFacebookIntegrationForSelect/Validation";
// import { getPixelsFacebookIntegrationForSelectController } from "../../../../../core/getPixelsFacebookIntegrationForSelect";
// import { getFacebookIntegrationsValidation } from "../../../../../core/getFacebookIntegrations/Validation";
// import { getFacebookIntegrationsController } from "../../../../../core/getFacebookIntegrations";
// import { getFacebookIntegrationValidation } from "../../../../../core/getFacebookIntegration/Validation";
// import { getFacebookIntegrationController } from "../../../../../core/getFacebookIntegration";
// import { getFacebookIntegrationDetailsValidation } from "../../../../../core/getFacebookIntegrationDetails/Validation";
// import { getFacebookIntegrationDetailsController } from "../../../../../core/getFacebookIntegrationDetails";
// import { getFacebookIntegrationsForSelectValidation } from "../../../../../core/getFacebookIntegrationsForSelect/Validation";
// import { getFacebookIntegrationsForSelectController } from "../../../../../core/getFacebookIntegrationsForSelect";
// import { getCustomerValidation } from "../../../../../core/getCustomer/Validation";
// import { getCustomerController } from "../../../../../core/getCustomer";
import { getBusinessDetailsValidation } from "../../../../../core/getBusinessDetails/Validation";
import { getBusinessDetailsController } from "../../../../../core/getBusinessDetails";

const RouterV1Private_Get = Router();

RouterV1Private_Get.get(
  "/contacts-wa",
  getContactWAOnAccountValidation,
  getContactWAOnAccountController
);

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

RouterV1Private_Get.get(
  "/status-session-whatsapp/:connectionId",
  getStatusSessionWhatsappPublicValidation,
  getStatusSessionWhatsappPublicController
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

// RouterV1Private_Get.get(
//   "/campaign-options",
//   getCampaignOnAccountForSelectValidation,
//   getCampaignOnAccountForSelectController
// );

// RouterV1Private_Get.get(
//   "/audience-options",
//   getAudienceOnAccountForSelectValidation,
//   getAudienceOnAccountForSelectController
// );

// RouterV1Private_Get.get(
//   "/campaign-parameters",
//   getCampaignParameterValidation,
//   getCampaignParameterController
// );

// RouterV1Private_Get.get(
//   "/campaign-parameter/:id",
//   getCampaignParameterIdValidation,
//   getCampaignParameterIdController
// );

// RouterV1Private_Get.get(
//   "/campaign-audiences",
//   getCampaignAudiencesValidation,
//   getCampaignAudiencesController
// );

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

// RouterV1Private_Get.get(
//   "/parameters-options",
//   getParametersOnAccountForSelectValidation,
//   getParametersOnAccountForSelectController
// );

// RouterV1Private_Get.get(
//   "/campaigns",
//   getCampaignsValidation,
//   getCampaignsController
// );

// RouterV1Private_Get.get(
//   "/static-file",
//   getStaticFileValidation,
//   getStaticFileController
// );

// RouterV1Private_Get.get(
//   "/checkpoints-options",
//   getCheckPointsForSelectValidation,
//   getCheckPointsForSelectController
// );

// RouterV1Private_Get.get(
//   "/checkpoints",
//   getCheckPointsValidation,
//   getCheckPointsController
// );

// RouterV1Private_Get.get(
//   "/campaign-audience-options",
//   getCampaignAudienceForSelectValidation,
//   getCampaignAudienceForSelectController
// );

// RouterV1Private_Get.get(
//   "/campaign-parameter-ranges",
//   getCampaignParameterRangesValidation,
//   getCampaignParameterRangesController
// );

// RouterV1Private_Get.get(
//   "/supervisors",
//   getSupervisorsValidation,
//   getSupervisorsController
// );

// RouterV1Private_Get.get(
//   "/sectors-attendants",
//   getSectorsAttendantsValidation,
//   getSectorsAttendantsController
// );

// RouterV1Private_Get.get(
//   "/sectors-options",
//   getSectorsForSelectValidation,
//   getSectorsForSelectController
// );

// RouterV1Private_Get.get(
//   "/supervisors-options",
//   geSupervisorsForSelectValidation,
//   geSupervisorsForSelectController
// );

// RouterV1Private_Get.get(
//   "/sectors-attendants-options",
//   getSectorsAttendantsForSelectValidation,
//   getSectorsAttendantsForSelectController
// );

// RouterV1Private_Get.get(
//   "/sectors-attendants/:id",
//   getSectorsAttendantValidation,
//   getSectorsAttendantController
// );

// RouterV1Private_Get.get("/sectors", getSectorsValidation, getSectorsController);

// RouterV1Private_Get.get(
//   "/emails-services-configuration",
//   getEmailsServicesConfigurationValidation,
//   getEmailsServicesConfigurationController
// );

// RouterV1Private_Get.get(
//   "/email-service-configuration/:id",
//   getEmailServiceConfigurationValidation,
//   getEmailServiceConfigurationController
// );

// RouterV1Private_Get.get(
//   "/email-service-configuration/details/:id",
//   getEmailServiceConfigurationDetailsValidation,
//   getEmailServiceConfigurationDetailsController
// );

// RouterV1Private_Get.get(
//   "/email-service-configuration-options",
//   getEmailServiceConfigurationForSelectValidation,
//   getEmailServiceConfigurationForSelectController
// );

// RouterV1Private_Get.get(
//   "/links-tracking-pixel",
//   getLinksTrackingPixelValidation,
//   getLinksTrackingPixelController
// );

// RouterV1Private_Get.get(
//   "/link-tracking-pixel-options",
//   getLinkTrackingPixelForSelectValidation,
//   getLinkTrackingPixelForSelectController
// );

// RouterV1Private_Get.get(
//   "/authorization-account",
//   getAuthorizationAccountValidation,
//   getAuthorizationAccountController
// );

RouterV1Private_Get.get(
  "/chatbots",
  getChabotsValidation,
  getChabotsController
);

RouterV1Private_Get.get(
  "/chatbot/options",
  getChabotsForSelectValidation,
  getChabotsForSelectController
);

RouterV1Private_Get.get(
  "/chatbot/:id",
  getChatbotValidation,
  getChatbotController
);

RouterV1Private_Get.get(
  "/chatbot/:id/details",
  getChatbotDetailsValidation,
  getChatbotDetailsController
);

// RouterV1Private_Get.get(
//   "/integration/details/:id",
//   getIntegrationDetailsValidation,
//   getIntegrationDetailsController
// );

// RouterV1Private_Get.get(
//   "/integration/:id",
//   getIntegrationValidation,
//   getIntegrationController
// );

// RouterV1Private_Get.get(
//   "/integrations",
//   getIntegrationsValidation,
//   getIntegrationsController
// );

// RouterV1Private_Get.get(
//   "/integrations-options",
//   getIntegrationsForSelectValidation,
//   getIntegrationsForSelectController
// );

// RouterV1Private_Get.get(
//   "/boards-trello-options/:integrationId",
//   getBoardsTrelloForSelectValidation,
//   getBoardsTrelloForSelectController
// );

// RouterV1Private_Get.get(
//   "/list-boards-trello-options/:integrationId/:boardId",
//   getListOfBoardTrelloForSelectValidation,
//   getListOfBoardTrelloForSelectController
// );

RouterV1Private_Get.get(
  "/data-dashboard",
  getDataDashboardValidation,
  getDataDashboardController
);

// RouterV1Private_Get.get(
//   "/sub-user",
//   getSubAccountsValidation,
//   getSubAccountsController
// );

// RouterV1Private_Get.get(
//   "/sub-user/:id",
//   getSubAccountValidation,
//   getSubAccountController
// );

// RouterV1Private_Get.get(
//   "/sub-user/details/:id",
//   getSubAccountDetailsValidation,
//   getSubAccountDetailsController
// );

// RouterV1Private_Get.get("/plans", getPlansValidation, getPlansController);
// RouterV1Private_Get.get(
//   "/periods-plan/:planId",
//   getPeriodsPlanPublicValidation,
//   getPeriodsPlanPublicController
// );

// RouterV1Private_Get.get("/plan/:id", getPlanValidation, getPlanController);

// RouterV1Private_Get.get(
//   "/customer",
//   getCustomerValidation,
//   getCustomerController
// );

// RouterV1Private_Get.get(
//   "/extra-packages",
//   getExtraPackagesValidation,
//   getExtraPackagesController
// );

// RouterV1Private_Get.get(
//   "/extra-package/:id",
//   getExtraPackageValidation,
//   getExtraPackageController
// );

// RouterV1Private_Get.get(
//   "/funil-kanban",
//   getFunnelKanbansValidation,
//   getFunnelKanbansController
// );

// RouterV1Private_Get.get(
//   "/funil-kanban-columns-options",
//   geKanbanColumnForSelectFlowValidation,
//   geKanbanColumnForSelectFlowController
// );

// RouterV1Private_Get.get(
//   "/funil-kanban-options",
//   geKanbanForSelectValidation,
//   geKanbanForSelectController
// );

// RouterV1Private_Get.get(
//   "/credit-cards",
//   getCreditCardValidation,
//   getCreditCardController
// );

RouterV1Private_Get.get(
  "/my-account",
  getMyAccountValidation,
  getMyAccountController
);

// RouterV1Private_Get.get(
//   "/discount-coupom/:code",
//   getDiscountCoupomValidation,
//   getDiscountCoupomController
// );

// RouterV1Private_Get.get(
//   "/subscriptions",
//   getSubscriptionsADMValidation,
//   getSubscriptionsADMController
// );

// RouterV1Private_Get.get(
//   "/payments-subscription/:id",
//   getPaymentsSubscriptionsADMValidation,
//   getPaymentsSubscriptionsADMController
// );

// RouterV1Private_Get.get(
//   "/payments",
//   getPaymentsADMValidation,
//   getPaymentsADMController
// );

// RouterV1Private_Get.get(
//   "/funil-kanban/:id",
//   getFunnelKanbanADMValidation,
//   getFunnelKanbanADMController
// );

// RouterV1Private_Get.get(
//   "/supervisor/:id",
//   getSupervisorValidation,
//   getSupervisorController
// );

// RouterV1Private_Get.get(
//   "/supervisor/details/:id",
//   getSupervisorDetailsValidation,
//   getSupervisorDetailsController
// );

// RouterV1Private_Get.get(
//   "/sectors-attendants/details/:id",
//   getSectorsAttendantDetailsValidation,
//   getSectorsAttendantDetailsController
// );

// RouterV1Private_Get.get(
//   "/sector/:id",
//   getSectorValidation,
//   getSectorController
// );

// RouterV1Private_Get.get(
//   "/sector/details/:id",
//   getSectorDetailsValidation,
//   getSectorDetailsController
// );

// RouterV1Private_Get.get(
//   "/checkpoint/:id",
//   getCheckpointValidation,
//   getCheckpointController
// );

// RouterV1Private_Get.get(
//   "/checkpoint/details/:id",
//   getCheckpointDetailsValidation,
//   getCheckpointDetailsController
// );

// RouterV1Private_Get.get(
//   "/link-tracking-pixel/:id",
//   getLinkTrackingPixelValidation,
//   getLinkTrackingPixelController
// );

// RouterV1Private_Get.get(
//   "/link-tracking-pixel/details/:id",
//   getLinkTrackingPixelDetailsValidation,
//   getLinkTrackingPixelDetailsController
// );

// RouterV1Private_Get.get(
//   "/campaign-audience/:id",
//   getCampaignAudienceValidation,
//   getCampaignAudienceController
// );

// RouterV1Private_Get.get(
//   "/campaign-audience/details/:id",
//   getCampaignAudienceDetailsValidation,
//   getCampaignAudienceDetailsController
// );

// RouterV1Private_Get.get(
//   "/campaign-parameter/details/:id",
//   getCampaignParameterDetailsValidation,
//   getCampaignParameterDetailsController
// );

// RouterV1Private_Get.get(
//   "/campaign-ondemand/:id",
//   getCampaignOndemandValidation,
//   getCampaignOndemandController
// );

// RouterV1Private_Get.get(
//   "/campaign-ondemand/details/:id",
//   getCampaignOndemandDetailsValidation,
//   getCampaignOndemandDetailsController
// );

// RouterV1Private_Get.get(
//   "/campaign/:id",
//   getCampaignValidation,
//   getCampaignController
// );

// RouterV1Private_Get.get(
//   "/campaign/details/:id",
//   getCampaignDetailsValidation,
//   getCampaignDetailsController
// );

// RouterV1Private_Get.get(
//   "/geolocations",
//   getGeolocationsValidation,
//   getGeolocationsController
// );

// RouterV1Private_Get.get(
//   "/geolocations/:id",
//   getGeolocationValidation,
//   getGeolocationController
// );

// RouterV1Private_Get.get(
//   "/geolocations/details/:id",
//   getGeolocationDetailsValidation,
//   getGeolocationDetailsController
// );

// RouterV1Private_Get.get(
//   "/geolocations-options",
//   getGeolocationForSelectValidation,
//   getGeolocationForSelectController
// );

// RouterV1Private_Get.get(
//   "/campaign-audience/:id/export/download",
//   getFileCampaignAudienceValidation,
//   getFileCampaignAudienceController
// );

// RouterV1Private_Get.get(
//   "/campaign-audience/:id/export/link",
//   getLinkFileCampaignAudienceValidation,
//   getLinkFileCampaignAudienceController
// );

// RouterV1Private_Get.get(
//   "/integration-ai-options",
//   getIntegrationAiForSelectValidation,
//   getIntegrationAiForSelectController
// );

// RouterV1Private_Get.get(
//   "/integration-ai/:id",
//   getIntegrationAiValidation,
//   getIntegrationAiController
// );

// RouterV1Private_Get.get(
//   "/integrations-ai",
//   getIntegrationsAiValidation,
//   getIntegrationsAiController
// );

// RouterV1Private_Get.get(
//   "/integrations-ai/details/:id",
//   getIntegrationAiDetailsValidation,
//   getIntegrationAiDetailsController
// );

// RouterV1Private_Get.get(
//   "/attendant-ai/:id",
//   getAttendantAiValidation,
//   getAttendantAiController
// );

// RouterV1Private_Get.get(
//   "/attendant-ai-options",
//   getAttendantAiForSelectValidation,
//   getAttendantAiForSelectController
// );

// RouterV1Private_Get.get(
//   "/attendants-ai",
//   getAttendantsAiValidation,
//   getAttendantsAiController
// );

// RouterV1Private_Get.get(
//   "/attendant-ai/details/:id",
//   getAttendantAiDetailsValidation,
//   getAttendantAiDetailsController
// );

// RouterV1Private_Get.get(
//   "/facebook-integration/:id/business-options",
//   getBusinessFacebookIntegrationForSelectValidation,
//   getBusinessFacebookIntegrationForSelectController
// );

// RouterV1Private_Get.get(
//   "/facebook-integration/:id/pixels-options/:fbBusinessId",
//   getPixelsFacebookIntegrationForSelectValidation,
//   getPixelsFacebookIntegrationForSelectController
// );

// RouterV1Private_Get.get(
//   "/facebook-integrations",
//   getFacebookIntegrationsValidation,
//   getFacebookIntegrationsController
// );

// RouterV1Private_Get.get(
//   "/facebook-integration/:id",
//   getFacebookIntegrationValidation,
//   getFacebookIntegrationController
// );

// RouterV1Private_Get.get(
//   "/facebook-integration/details/:id",
//   getFacebookIntegrationDetailsValidation,
//   getFacebookIntegrationDetailsController
// );

// RouterV1Private_Get.get(
//   "/facebook-integrations-options",
//   getFacebookIntegrationsForSelectValidation,
//   getFacebookIntegrationsForSelectController
// );

export default RouterV1Private_Get;
