import { NextFunction, Request, Response, Router } from "express";
import { getAccountUserController } from "../../../../../core/getAccountUserPublic";
import { getAccountUserValidation } from "../../../../../core/getAccountUserPublic/Validation";
import { getAudienceOnAccountForSelectController } from "../../../../../core/getAudienceOnAccountForSelect";
import { getAudienceOnAccountForSelectValidation } from "../../../../../core/getAudienceOnAccountForSelect/Validation";
import { getAuthorizationAccountController } from "../../../../../core/getAuthorizationAccount";
import { getAuthorizationAccountValidation } from "../../../../../core/getAuthorizationAccount/Validation";
import { getBoardsTrelloForSelectController } from "../../../../../core/getBoardsTrelloForSelect";
import { getBoardsTrelloForSelectValidation } from "../../../../../core/getBoardsTrelloForSelect/Validation";
import { getBusinessIdOnAccountController } from "../../../../../core/getBusiness";
import { getBusinessIdOnAccountValidation } from "../../../../../core/getBusiness/Validation";
import { getBusinessesController } from "../../../../../core/getBusinesses";
import { getBusinessValidation } from "../../../../../core/getBusinesses/Validation";
import { getBusinessOnAccountForSelectController } from "../../../../../core/getBusinessOnAccountForSelect";
import { getBusinessOnAccountForSelectValidation } from "../../../../../core/getBusinessOnAccountForSelect/Validation";
import { getCampaignsController } from "../../../../../core/getCampaigns";
import { getCampaignsValidation } from "../../../../../core/getCampaigns/Validation";
import { getCampaignAudiencesController } from "../../../../../core/getCampaignAudiences";
import { getCampaignAudiencesValidation } from "../../../../../core/getCampaignAudiences/Validation";
import { getCampaignAudienceForSelectController } from "../../../../../core/getCampaignAudienceForSelect";
import { getCampaignAudienceForSelectValidation } from "../../../../../core/getCampaignAudienceForSelect/Validation";
import { getCampaignOnAccountForSelectController } from "../../../../../core/getCampaignOnAccountForSelect";
import { getCampaignOnAccountForSelectValidation } from "../../../../../core/getCampaignOnAccountForSelect/Validation";
import { getCampaignParameterController } from "../../../../../core/getCampaignParameter";
import { getCampaignParameterValidation } from "../../../../../core/getCampaignParameter/Validation";
import { getCampaignParameterIdController } from "../../../../../core/getCampaignParameterId";
import { getCampaignParameterIdValidation } from "../../../../../core/getCampaignParameterId/Validation";
import { getCampaignParameterRangesController } from "../../../../../core/getCampaignParameterRanges";
import { getCampaignParameterRangesValidation } from "../../../../../core/getCampaignParameterRanges/Validation";
import { getChabotsController } from "../../../../../core/getChatbots";
import { getChabotsValidation } from "../../../../../core/getChatbots/Validation";
import { getChabotsForSelectController } from "../../../../../core/getChatbotsForSelect";
import { getChabotsForSelectValidation } from "../../../../../core/getChatbotsForSelect/Validation";
import { getCheckPointsController } from "../../../../../core/getCheckPoints";
import { getCheckPointsValidation } from "../../../../../core/getCheckPoints/Validation";
import { getCheckPointsForSelectController } from "../../../../../core/getCheckPointsForSelect";
import { getCheckPointsForSelectValidation } from "../../../../../core/getCheckPointsForSelect/Validation";
import { getConnectionWAController } from "../../../../../core/getConnectionWA";
import { getConnectionWAValidation } from "../../../../../core/getConnectionWA/Validation";
import { getConnectionWAUserController } from "../../../../../core/getConnectionWAUser";
import { getConnectionWAUserValidation } from "../../../../../core/getConnectionWAUser/Validation";
import { getConnectionsOnBusinessForSelectController } from "../../../../../core/getConnectionsOnBusinessForSelect";
import { getConnectionsOnBusinessForSelectValidation } from "../../../../../core/getConnectionsOnBusinessForSelect/Validation";
import { getConnectionsWAController } from "../../../../../core/getConnectionsWA";
import { getConnectionsWAValidation } from "../../../../../core/getConnectionsWA/Validation";
import { getContactWAOnAccountController } from "../../../../../core/getContactWAOnAccount";
import { getContactWAOnAccountValidation } from "../../../../../core/getContactWAOnAccount/Validation";
import { getDataDashboardController } from "../../../../../core/getDataDashboard";
import { getDataDashboardValidation } from "../../../../../core/getDataDashboard/Validation";
import { getDataFlowIdController } from "../../../../../core/getDataFlowId";
import { getDataFlowIdValidation } from "../../../../../core/getDataFlowId/Validation";
import { getEmailsServicesConfigurationController } from "../../../../../core/getEmailsServicesConfiguration";
import { getEmailsServicesConfigurationValidation } from "../../../../../core/getEmailsServicesConfiguration/Validation";
import { getEmailServiceConfigurationForSelectController } from "../../../../../core/getEmailServiceConfigurationForSelect";
import { getEmailServiceConfigurationForSelectValidation } from "../../../../../core/getEmailServiceConfigurationForSelect/Validation";
import { getExtraPackageController } from "../../../../../core/getExtraPackage";
import { getExtraPackageValidation } from "../../../../../core/getExtraPackage/Validation";
import { getExtraPackagesController } from "../../../../../core/getExtraPackages";
import { getExtraPackagesValidation } from "../../../../../core/getExtraPackages/Validation";
import { getFieldsConnectionWAController } from "../../../../../core/getFieldsConnectionWA";
import { getFieldsConnectionWAValidation } from "../../../../../core/getFieldsConnectionWA/Validation";
import { getFlowOnBusinessForSelectController } from "../../../../../core/getFlowOnBusinessForSelect";
import { getFlowOnBusinessForSelectValidation } from "../../../../../core/getFlowOnBusinessForSelect/Validation";
import { getFlowsController } from "../../../../../core/getFlows";
import { getFlowsValidation } from "../../../../../core/getFlows/Validation";
import { getFunnelKanbansController } from "../../../../../core/getFunnelKanbans";
import { getFunnelKanbansValidation } from "../../../../../core/getFunnelKanbans/Validation";
import { getIntegrationsController } from "../../../../../core/getIntegrations";
import { getIntegrationsValidation } from "../../../../../core/getIntegrations/Validation";
import { getIntegrationsForSelectController } from "../../../../../core/getIntegrationsForSelect";
import { getIntegrationsForSelectValidation } from "../../../../../core/getIntegrationsForSelect/Validation";
import { geKanbanColumnForSelectFlowController } from "../../../../../core/getKanbanColumnForSelectFlow";
import { geKanbanColumnForSelectFlowValidation } from "../../../../../core/getKanbanColumnForSelectFlow/Validation";
import { geKanbanForSelectController } from "../../../../../core/getKanbanForSelect2";
import { geKanbanForSelectValidation } from "../../../../../core/getKanbanForSelect2/Validation";
import { getLinksTrackingPixelController } from "../../../../../core/getLinksTrackingPixel";
import { getLinksTrackingPixelValidation } from "../../../../../core/getLinksTrackingPixel/Validation";
import { getLinkTrackingPixelForSelectController } from "../../../../../core/getLinkTrackingPixelForSelect";
import { getLinkTrackingPixelForSelectValidation } from "../../../../../core/getLinkTrackingPixelForSelect/Validation";
import { getListOfBoardTrelloForSelectController } from "../../../../../core/getListOfBoardTrelloForSelect";
import { getListOfBoardTrelloForSelectValidation } from "../../../../../core/getListOfBoardTrelloForSelect/Validation";
import { getParametersOnAccountForSelectController } from "../../../../../core/getParametersOnAccountForSelect";
import { getParametersOnAccountForSelectValidation } from "../../../../../core/getParametersOnAccountForSelect/Validation";
import { getPeriodsPlanPublicController } from "../../../../../core/getPeriodsPlanPublic";
import { getPeriodsPlanPublicValidation } from "../../../../../core/getPeriodsPlanPublic/Validation";
import { getPlanController } from "../../../../../core/getPlan";
import { getPlanValidation } from "../../../../../core/getPlan/Validation";
import { getPlansController } from "../../../../../core/getPlans";
import { getSectorsController } from "../../../../../core/getSectors";
import { getSectorsValidation } from "../../../../../core/getSectors/Validation";
import { getSectorsAttendantsController } from "../../../../../core/getSectorsAttendants";
import { getSectorsAttendantsValidation } from "../../../../../core/getSectorsAttendants/Validation";
import { getSectorsAttendantsForSelectController } from "../../../../../core/getSectorsAttendantsForSelect";
import { getSectorsAttendantsForSelectValidation } from "../../../../../core/getSectorsAttendantsForSelect/Validation";
import { getSectorsForSelectController } from "../../../../../core/getSectorsForSelect";
import { getSectorsForSelectValidation } from "../../../../../core/getSectorsForSelect/Validation";
import { getStaticFileController } from "../../../../../core/getStaticFile";
import { getStaticFileValidation } from "../../../../../core/getStaticFile/Validation";
import { getStatusSessionWhatsappPublicController } from "../../../../../core/getStatusSessionWhatsappPublic";
import { getStatusSessionWhatsappPublicValidation } from "../../../../../core/getStatusSessionWhatsappPublic/Validation";
import { getSubAccountController } from "../../../../../core/getSubAccount";
import { getSubAccountValidation } from "../../../../../core/getSubAccount/Validation";
import { getSupervisorsController } from "../../../../../core/getSupervisors";
import { getSupervisorsValidation } from "../../../../../core/getSupervisors/Validation";
import { geSupervisorsForSelectController } from "../../../../../core/getSupervisorsForSelect";
import { geSupervisorsForSelectValidation } from "../../../../../core/getSupervisorsForSelect/Validation";
import { getTagsController } from "../../../../../core/getTags";
import { getTagsValidation } from "../../../../../core/getTags/Validation";
import { getTagForSelectController } from "../../../../../core/getTagForSelect";
import { getTagForSelectValidation } from "../../../../../core/getTagForSelect/Validation";
import { getVariableForSelectController } from "../../../../../core/getVariableForSelect";
import { getVariableForSelectValidation } from "../../../../../core/getVariableForSelect/Validation";
import { getVariableBusinessController } from "../../../../../core/getVariables";
import { getVariableBusinessValidation } from "../../../../../core/getVariables/Validation";
import { getCreditCardValidation } from "../../../../../core/getCreditCards/Validation";
import { getCreditCardController } from "../../../../../core/getCreditCards";
import { getMyAccountController } from "../../../../../core/getMyAccount";
import { getMyAccountValidation } from "../../../../../core/getMyAccount/Validation";
import { getDiscountCoupomValidation } from "../../../../../core/getDiscountCoupom/Validation";
import { getDiscountCoupomController } from "../../../../../core/getDiscountCoupom";
import { getPlansValidation } from "../../../../../core/getPlans/Validation";
import { getSubscriptionsADMValidation } from "../../../../../core/getSubscriptionsADM/Validation";
import { getSubscriptionsADMController } from "../../../../../core/getSubscriptionsADM";
import { getPaymentsSubscriptionsADMController } from "../../../../../core/getPaymentsSubscriptionADM";
import { getPaymentsSubscriptionsADMValidation } from "../../../../../core/getPaymentsSubscriptionADM/Validation";
import { getPaymentsADMValidation } from "../../../../../core/getPaymentsADM/Validation";
import { getPaymentsADMController } from "../../../../../core/getPaymentsADM";
import { getFunnelKanbanADMValidation } from "../../../../../core/getFunnelKanbanADM/Validation";
import { getFunnelKanbanADMController } from "../../../../../core/getFunnelKanbanADM";
import { getSupervisorValidation } from "../../../../../core/getSupervisor/Validation";
import { getSupervisorController } from "../../../../../core/getSupervisor";
import { getSupervisorDetailsValidation } from "../../../../../core/getSupervisorDetails/Validation";
import { getSupervisorDetailsController } from "../../../../../core/getSupervisorDetails";
import { getSectorsAttendantValidation } from "../../../../../core/getSectorsAttendant/Validation";
import { getSectorsAttendantController } from "../../../../../core/getSectorsAttendant";
import { getSectorsAttendantDetailsController } from "../../../../../core/getSectorsAttendantDetails";
import { getSectorsAttendantDetailsValidation } from "../../../../../core/getSectorsAttendantDetails/Validation";
import { getSectorValidation } from "../../../../../core/getSector/Validation";
import { getSectorController } from "../../../../../core/getSector";
import { getSectorDetailsValidation } from "../../../../../core/getSectorDetails/Validation";
import { getSectorDetailsController } from "../../../../../core/getSectorDetails";
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
import { getCheckpointValidation } from "../../../../../core/getCheckpoint/Validation";
import { getCheckpointController } from "../../../../../core/getCheckpoint";
import { getCheckpointDetailsValidation } from "../../../../../core/getCheckpointDetails/Validation";
import { getCheckpointDetailsController } from "../../../../../core/getCheckpointDetails";
import { getLinkTrackingPixelValidation } from "../../../../../core/getLinkTrackingPixel/Validation";
import { getLinkTrackingPixelController } from "../../../../../core/getLinkTrackingPixel";
import { getLinkTrackingPixelDetailsValidation } from "../../../../../core/getLinkTrackingPixelDetails/Validation";
import { getLinkTrackingPixelDetailsController } from "../../../../../core/getLinkTrackingPixelDetails";
import { getCampaignAudienceValidation } from "../../../../../core/getCampaignAudience/Validation";
import { getCampaignAudienceController } from "../../../../../core/getCampaignAudience";
import { getCampaignAudienceDetailsValidation } from "../../../../../core/getCampaignAudienceDetails/Validation";
import { getCampaignAudienceDetailsController } from "../../../../../core/getCampaignAudienceDetails";
import { getCampaignParameterDetailsValidation } from "../../../../../core/getCampaignParameterDetails/Validation";
import { getCampaignParameterDetailsController } from "../../../../../core/getCampaignParameterDetails";
import { getCampaignOndemandValidation } from "../../../../../core/getCampaignOndemand/Validation";
import { getCampaignOndemandController } from "../../../../../core/getCampaignOndemand";
import { getCampaignOndemandDetailsValidation } from "../../../../../core/getCampaignOndemandDetails/Validation";
import { getCampaignOndemandDetailsController } from "../../../../../core/getCampaignOndemandDetails";
import { getCampaignValidation } from "../../../../../core/getCampaign/Validation";
import { getCampaignController } from "../../../../../core/getCampaign";
import { getCampaignDetailsValidation } from "../../../../../core/getCampaignDetails/Validation";
import { getCampaignDetailsController } from "../../../../../core/getCampaignDetails";
import { getChatbotValidation } from "../../../../../core/getChatbot/Validation";
import { getChatbotController } from "../../../../../core/getChatbot";
import { getChatbotDetailsValidation } from "../../../../../core/getChatbotDetails/Validation";
import { getChatbotDetailsController } from "../../../../../core/getChatbotDetails";
import { getGeolocationsValidation } from "../../../../../core/getGeolocations/Validation";
import { getGeolocationsController } from "../../../../../core/getGeolocations";
import { getGeolocationValidation } from "../../../../../core/getGeolocation/Validation";
import { getGeolocationController } from "../../../../../core/getGeolocation";
import { getGeolocationDetailsValidation } from "../../../../../core/getGeolocationDetails/Validation";
import { getGeolocationDetailsController } from "../../../../../core/getGeolocationDetails";
import { getGeolocationForSelectValidation } from "../../../../../core/getGeolocationsForSelect/Validation";
import { getGeolocationForSelectController } from "../../../../../core/getGeolocationsForSelect";
import { getEmailServiceConfigurationDetailsValidation } from "../../../../../core/getEmailServiceConfigurationDetails/Validation";
import { getEmailServiceConfigurationDetailsController } from "../../../../../core/getEmailServiceConfigurationDetails";
import { getEmailServiceConfigurationValidation } from "../../../../../core/getEmailServiceConfiguration/Validation";
import { getEmailServiceConfigurationController } from "../../../../../core/getEmailServiceConfiguration";
import { getSubAccountsValidation } from "../../../../../core/getSubAccounts/Validation";
import { getSubAccountsController } from "../../../../../core/getSubAccounts";
import { getSubAccountDetailsValidation } from "../../../../../core/getSubAccountDetails/Validation";
import { getSubAccountDetailsController } from "../../../../../core/getSubAccountDetails";
import { getIntegrationDetailsController } from "../../../../../core/getIntegrationDetails";
import { getIntegrationDetailsValidation } from "../../../../../core/getIntegrationDetails/Validation";
import { getIntegrationValidation } from "../../../../../core/getIntegration/Validation";
import { getIntegrationController } from "../../../../../core/getIntegration";
import { getFileCampaignAudienceValidation } from "../../../../../core/getFileCampaignAudience/Validation";
import { getFileCampaignAudienceController } from "../../../../../core/getFileCampaignAudience";
import { getLinkFileCampaignAudienceValidation } from "../../../../../core/getLinkFileCampaignAudience/Validation";
import { getLinkFileCampaignAudienceController } from "../../../../../core/getLinkFileCampaignAudience";
import { getIntegrationAiForSelectValidation } from "../../../../../core/getIntegrationAiForSelect/Validation";
import { getIntegrationAiForSelectController } from "../../../../../core/getIntegrationAiForSelect";
import { getIntegrationAiValidation } from "../../../../../core/getIntegrationAi/Validation";
import { getIntegrationAiController } from "../../../../../core/getIntegrationAi";
import { getIntegrationsAiValidation } from "../../../../../core/getIntegrationsAi/Validation";
import { getIntegrationsAiController } from "../../../../../core/getIntegrationsAi";
import { getIntegrationAiDetailsValidation } from "../../../../../core/getIntegrationAiDetails/Validation";
import { getIntegrationAiDetailsController } from "../../../../../core/getIntegrationAiDetails";
import { getAttendantAiController } from "../../../../../core/getAtendantAi";
import { getAttendantAiValidation } from "../../../../../core/getAtendantAi/Validation";
import { getAttendantAiForSelectValidation } from "../../../../../core/getAttendantAiForSelect/Validation";
import { getAttendantAiForSelectController } from "../../../../../core/getAttendantAiForSelect";
import { getAttendantsAiValidation } from "../../../../../core/getAttendantsAi/Validation";
import { getAttendantsAiController } from "../../../../../core/getAttendantsAi";
import { getAttendantAiDetailsValidation } from "../../../../../core/getAttendantAiDetails/Validation";
import { getAttendantAiDetailsController } from "../../../../../core/getAttendantAiDetails";
import { getBusinessFacebookIntegrationForSelectValidation } from "../../../../../core/getBusinessFacebookIntegrationForSelect/Validation";
import { getBusinessFacebookIntegrationForSelectController } from "../../../../../core/getBusinessFacebookIntegrationForSelect";
import { getPixelsFacebookIntegrationForSelectValidation } from "../../../../../core/getPixelsFacebookIntegrationForSelect/Validation";
import { getPixelsFacebookIntegrationForSelectController } from "../../../../../core/getPixelsFacebookIntegrationForSelect";
import { getFacebookIntegrationsValidation } from "../../../../../core/getFacebookIntegrations/Validation";
import { getFacebookIntegrationsController } from "../../../../../core/getFacebookIntegrations";
import { getFacebookIntegrationValidation } from "../../../../../core/getFacebookIntegration/Validation";
import { getFacebookIntegrationController } from "../../../../../core/getFacebookIntegration";
import { getFacebookIntegrationDetailsValidation } from "../../../../../core/getFacebookIntegrationDetails/Validation";
import { getFacebookIntegrationDetailsController } from "../../../../../core/getFacebookIntegrationDetails";
import { getFacebookIntegrationsForSelectValidation } from "../../../../../core/getFacebookIntegrationsForSelect/Validation";
import { getFacebookIntegrationsForSelectController } from "../../../../../core/getFacebookIntegrationsForSelect";
import { getCustomerValidation } from "../../../../../core/getCustomer/Validation";
import { getCustomerController } from "../../../../../core/getCustomer";
import { getBusinessDetailsValidation } from "../../../../../core/getBusinessDetails/Validation";
import { getBusinessDetailsController } from "../../../../../core/getBusinessDetails";

const RouterV1Private_Get = Router();

// RouterV1Private_Get.get("/plans");

const removeSubUserUid = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { subUserUid, ...reqb } = req.body;
  req.body = reqb;
  return next();
};

RouterV1Private_Get.get(
  "/contacts-wa",
  removeSubUserUid,
  getContactWAOnAccountValidation,
  getContactWAOnAccountController
);

RouterV1Private_Get.get(
  "/connections-wa",
  removeSubUserUid,
  getConnectionsWAValidation,
  getConnectionsWAController
);

RouterV1Private_Get.get(
  "/connection-wa/:id",
  removeSubUserUid,
  getConnectionWAValidation,
  getConnectionWAController
);

RouterV1Private_Get.get(
  "/connection-wa/fields/:id",
  removeSubUserUid,
  getFieldsConnectionWAValidation,
  getFieldsConnectionWAController
);

RouterV1Private_Get.get(
  "/connection-wa-user/:id",
  removeSubUserUid,
  getConnectionWAUserValidation,
  getConnectionWAUserController
);

RouterV1Private_Get.get(
  "/status-session-whatsapp/:connectionId",
  removeSubUserUid,
  getStatusSessionWhatsappPublicValidation,
  getStatusSessionWhatsappPublicController
);

RouterV1Private_Get.get(
  "/account-user",
  getAccountUserValidation,
  getAccountUserController
);

RouterV1Private_Get.get(
  "/tags",
  removeSubUserUid,
  getTagsValidation,
  getTagsController
);

RouterV1Private_Get.get(
  "/tag/:id",
  removeSubUserUid,
  getTagValidation,
  getTagController
);

RouterV1Private_Get.get(
  "/tag/details/:id",
  removeSubUserUid,
  getTagDetailsValidation,
  getTagDetailsController
);

RouterV1Private_Get.get(
  "/variable",
  removeSubUserUid,
  getVariableBusinessValidation,
  getVariableBusinessController
);

RouterV1Private_Get.get(
  "/businesses",
  removeSubUserUid,
  getBusinessValidation,
  getBusinessesController
);

RouterV1Private_Get.get(
  "/businesses/:id",
  removeSubUserUid,
  getBusinessIdOnAccountValidation,
  getBusinessIdOnAccountController
);

RouterV1Private_Get.get(
  "/businesses/:id/details",
  removeSubUserUid,
  getBusinessDetailsValidation,
  getBusinessDetailsController
);

RouterV1Private_Get.get(
  "/businesses/options",
  getBusinessOnAccountForSelectValidation,
  getBusinessOnAccountForSelectController
);

RouterV1Private_Get.get(
  "/campaign-options",
  removeSubUserUid,
  getCampaignOnAccountForSelectValidation,
  getCampaignOnAccountForSelectController
);

RouterV1Private_Get.get(
  "/audience-options",
  removeSubUserUid,
  getAudienceOnAccountForSelectValidation,
  getAudienceOnAccountForSelectController
);

RouterV1Private_Get.get(
  "/campaign-parameters",
  removeSubUserUid,
  getCampaignParameterValidation,
  getCampaignParameterController
);

RouterV1Private_Get.get(
  "/campaign-parameter/:id",
  removeSubUserUid,
  getCampaignParameterIdValidation,
  getCampaignParameterIdController
);

RouterV1Private_Get.get(
  "/tag-options/:businessIds",
  removeSubUserUid,
  getTagForSelectValidation,
  getTagForSelectController
);

RouterV1Private_Get.get(
  "/variable-options/:businessIds",
  removeSubUserUid,
  getVariableForSelectValidation,
  getVariableForSelectController
);

RouterV1Private_Get.get(
  "/campaign-audiences",
  removeSubUserUid,
  getCampaignAudiencesValidation,
  getCampaignAudiencesController
);

RouterV1Private_Get.get(
  "/flows",
  removeSubUserUid,
  getFlowsValidation,
  getFlowsController
);

RouterV1Private_Get.get(
  "/flow-data/:id",
  removeSubUserUid,
  getDataFlowIdValidation,
  getDataFlowIdController
);

RouterV1Private_Get.get(
  "/parameters-options",
  removeSubUserUid,
  getParametersOnAccountForSelectValidation,
  getParametersOnAccountForSelectController
);

RouterV1Private_Get.get(
  "/flows-options",
  removeSubUserUid,

  getFlowOnBusinessForSelectValidation,
  getFlowOnBusinessForSelectController
);

RouterV1Private_Get.get(
  "/connectionswa-options",
  removeSubUserUid,
  getConnectionsOnBusinessForSelectValidation,
  getConnectionsOnBusinessForSelectController
);

RouterV1Private_Get.get(
  "/campaigns",
  removeSubUserUid,
  getCampaignsValidation,
  getCampaignsController
);

RouterV1Private_Get.get(
  "/static-file",
  removeSubUserUid,
  getStaticFileValidation,
  getStaticFileController
);

RouterV1Private_Get.get(
  "/checkpoints-options",
  removeSubUserUid,
  getCheckPointsForSelectValidation,
  getCheckPointsForSelectController
);

RouterV1Private_Get.get(
  "/checkpoints",
  removeSubUserUid,
  getCheckPointsValidation,
  getCheckPointsController
);

RouterV1Private_Get.get(
  "/campaign-audience-options",
  removeSubUserUid,
  getCampaignAudienceForSelectValidation,
  getCampaignAudienceForSelectController
);

RouterV1Private_Get.get(
  "/campaign-parameter-ranges",
  removeSubUserUid,
  getCampaignParameterRangesValidation,
  getCampaignParameterRangesController
);

RouterV1Private_Get.get(
  "/supervisors",
  removeSubUserUid,
  getSupervisorsValidation,
  getSupervisorsController
);

RouterV1Private_Get.get(
  "/sectors-attendants",
  removeSubUserUid,
  getSectorsAttendantsValidation,
  getSectorsAttendantsController
);

RouterV1Private_Get.get(
  "/sectors-options",
  removeSubUserUid,
  getSectorsForSelectValidation,
  getSectorsForSelectController
);

RouterV1Private_Get.get(
  "/supervisors-options",
  removeSubUserUid,
  geSupervisorsForSelectValidation,
  geSupervisorsForSelectController
);

RouterV1Private_Get.get(
  "/sectors-attendants-options",
  removeSubUserUid,
  getSectorsAttendantsForSelectValidation,
  getSectorsAttendantsForSelectController
);

RouterV1Private_Get.get(
  "/sectors-attendants/:id",
  removeSubUserUid,
  getSectorsAttendantValidation,
  getSectorsAttendantController
);

RouterV1Private_Get.get(
  "/sectors",
  removeSubUserUid,
  getSectorsValidation,
  getSectorsController
);

RouterV1Private_Get.get(
  "/emails-services-configuration",
  removeSubUserUid,
  getEmailsServicesConfigurationValidation,
  getEmailsServicesConfigurationController
);

RouterV1Private_Get.get(
  "/email-service-configuration/:id",
  removeSubUserUid,
  getEmailServiceConfigurationValidation,
  getEmailServiceConfigurationController
);

RouterV1Private_Get.get(
  "/email-service-configuration/details/:id",
  removeSubUserUid,
  getEmailServiceConfigurationDetailsValidation,
  getEmailServiceConfigurationDetailsController
);

RouterV1Private_Get.get(
  "/email-service-configuration-options",
  removeSubUserUid,
  getEmailServiceConfigurationForSelectValidation,
  getEmailServiceConfigurationForSelectController
);

RouterV1Private_Get.get(
  "/links-tracking-pixel",
  removeSubUserUid,
  getLinksTrackingPixelValidation,
  getLinksTrackingPixelController
);

RouterV1Private_Get.get(
  "/link-tracking-pixel-options",
  removeSubUserUid,
  getLinkTrackingPixelForSelectValidation,
  getLinkTrackingPixelForSelectController
);

RouterV1Private_Get.get(
  "/authorization-account",
  removeSubUserUid,
  getAuthorizationAccountValidation,
  getAuthorizationAccountController
);

RouterV1Private_Get.get(
  "/chatbots",
  removeSubUserUid,
  getChabotsValidation,
  getChabotsController
);

RouterV1Private_Get.get(
  "/chatbot/:id",
  removeSubUserUid,
  getChatbotValidation,
  getChatbotController
);

RouterV1Private_Get.get(
  "/chatbot/details/:id",
  removeSubUserUid,
  getChatbotDetailsValidation,
  getChatbotDetailsController
);

RouterV1Private_Get.get(
  "/chatbot-options",
  removeSubUserUid,
  getChabotsForSelectValidation,
  getChabotsForSelectController
);

RouterV1Private_Get.get(
  "/integration/details/:id",
  removeSubUserUid,
  getIntegrationDetailsValidation,
  getIntegrationDetailsController
);

RouterV1Private_Get.get(
  "/integration/:id",
  removeSubUserUid,
  getIntegrationValidation,
  getIntegrationController
);

RouterV1Private_Get.get(
  "/integrations",
  removeSubUserUid,
  getIntegrationsValidation,
  getIntegrationsController
);

RouterV1Private_Get.get(
  "/integrations-options",
  removeSubUserUid,
  getIntegrationsForSelectValidation,
  getIntegrationsForSelectController
);

RouterV1Private_Get.get(
  "/boards-trello-options/:integrationId",
  removeSubUserUid,
  getBoardsTrelloForSelectValidation,
  getBoardsTrelloForSelectController
);

RouterV1Private_Get.get(
  "/list-boards-trello-options/:integrationId/:boardId",
  removeSubUserUid,
  getListOfBoardTrelloForSelectValidation,
  getListOfBoardTrelloForSelectController
);

RouterV1Private_Get.get(
  "/data-dashboard",
  removeSubUserUid,
  getDataDashboardValidation,
  getDataDashboardController
);

RouterV1Private_Get.get(
  "/sub-user",
  removeSubUserUid,
  getSubAccountsValidation,
  getSubAccountsController
);

RouterV1Private_Get.get(
  "/sub-user/:id",
  removeSubUserUid,
  getSubAccountValidation,
  getSubAccountController
);

RouterV1Private_Get.get(
  "/sub-user/details/:id",
  removeSubUserUid,
  getSubAccountDetailsValidation,
  getSubAccountDetailsController
);

RouterV1Private_Get.get(
  "/plans",
  removeSubUserUid,
  getPlansValidation,
  getPlansController
);
RouterV1Private_Get.get(
  "/periods-plan/:planId",
  removeSubUserUid,
  getPeriodsPlanPublicValidation,
  getPeriodsPlanPublicController
);

RouterV1Private_Get.get(
  "/plan/:id",
  removeSubUserUid,
  getPlanValidation,
  getPlanController
);

RouterV1Private_Get.get(
  "/customer",
  removeSubUserUid,
  getCustomerValidation,
  getCustomerController
);

RouterV1Private_Get.get(
  "/extra-packages",
  removeSubUserUid,
  getExtraPackagesValidation,
  getExtraPackagesController
);

RouterV1Private_Get.get(
  "/extra-package/:id",
  removeSubUserUid,
  getExtraPackageValidation,
  getExtraPackageController
);

RouterV1Private_Get.get(
  "/funil-kanban",
  removeSubUserUid,
  getFunnelKanbansValidation,
  getFunnelKanbansController
);

RouterV1Private_Get.get(
  "/funil-kanban-columns-options",
  removeSubUserUid,
  geKanbanColumnForSelectFlowValidation,
  geKanbanColumnForSelectFlowController
);

RouterV1Private_Get.get(
  "/funil-kanban-options",
  removeSubUserUid,
  geKanbanForSelectValidation,
  geKanbanForSelectController
);

RouterV1Private_Get.get(
  "/credit-cards",
  removeSubUserUid,
  getCreditCardValidation,
  getCreditCardController
);

RouterV1Private_Get.get(
  "/my-account",
  removeSubUserUid,
  getMyAccountValidation,
  getMyAccountController
);

RouterV1Private_Get.get(
  "/discount-coupom/:code",
  removeSubUserUid,
  getDiscountCoupomValidation,
  getDiscountCoupomController
);

RouterV1Private_Get.get(
  "/subscriptions",
  removeSubUserUid,
  getSubscriptionsADMValidation,
  getSubscriptionsADMController
);

RouterV1Private_Get.get(
  "/payments-subscription/:id",
  removeSubUserUid,
  getPaymentsSubscriptionsADMValidation,
  getPaymentsSubscriptionsADMController
);

RouterV1Private_Get.get(
  "/payments",
  removeSubUserUid,
  getPaymentsADMValidation,
  getPaymentsADMController
);

RouterV1Private_Get.get(
  "/funil-kanban/:id",
  removeSubUserUid,
  getFunnelKanbanADMValidation,
  getFunnelKanbanADMController
);

RouterV1Private_Get.get(
  "/supervisor/:id",
  removeSubUserUid,
  getSupervisorValidation,
  getSupervisorController
);

RouterV1Private_Get.get(
  "/supervisor/details/:id",
  removeSubUserUid,
  getSupervisorDetailsValidation,
  getSupervisorDetailsController
);

RouterV1Private_Get.get(
  "/sectors-attendants/details/:id",
  removeSubUserUid,
  getSectorsAttendantDetailsValidation,
  getSectorsAttendantDetailsController
);

RouterV1Private_Get.get(
  "/sector/:id",
  removeSubUserUid,
  getSectorValidation,
  getSectorController
);

RouterV1Private_Get.get(
  "/sector/details/:id",
  removeSubUserUid,
  getSectorDetailsValidation,
  getSectorDetailsController
);

RouterV1Private_Get.get("/flows/:id", getFlowValidation, getFlowController);

RouterV1Private_Get.get(
  "/flows/:id/details",
  getFlowDetailsValidation,
  getFlowDetailsController
);

RouterV1Private_Get.get(
  "/variable/:id",
  removeSubUserUid,
  getVariableValidation,
  getVariableController
);

RouterV1Private_Get.get(
  "/variable/details/:id",
  removeSubUserUid,
  getVariableDetailsValidation,
  getVariableDetailsController
);

RouterV1Private_Get.get(
  "/checkpoint/:id",
  removeSubUserUid,
  getCheckpointValidation,
  getCheckpointController
);

RouterV1Private_Get.get(
  "/checkpoint/details/:id",
  removeSubUserUid,
  getCheckpointDetailsValidation,
  getCheckpointDetailsController
);

RouterV1Private_Get.get(
  "/link-tracking-pixel/:id",
  removeSubUserUid,
  getLinkTrackingPixelValidation,
  getLinkTrackingPixelController
);

RouterV1Private_Get.get(
  "/link-tracking-pixel/details/:id",
  removeSubUserUid,
  getLinkTrackingPixelDetailsValidation,
  getLinkTrackingPixelDetailsController
);

RouterV1Private_Get.get(
  "/campaign-audience/:id",
  removeSubUserUid,
  getCampaignAudienceValidation,
  getCampaignAudienceController
);

RouterV1Private_Get.get(
  "/campaign-audience/details/:id",
  removeSubUserUid,
  getCampaignAudienceDetailsValidation,
  getCampaignAudienceDetailsController
);

RouterV1Private_Get.get(
  "/campaign-parameter/details/:id",
  removeSubUserUid,
  getCampaignParameterDetailsValidation,
  getCampaignParameterDetailsController
);

RouterV1Private_Get.get(
  "/campaign-ondemand/:id",
  removeSubUserUid,
  getCampaignOndemandValidation,
  getCampaignOndemandController
);

RouterV1Private_Get.get(
  "/campaign-ondemand/details/:id",
  removeSubUserUid,
  getCampaignOndemandDetailsValidation,
  getCampaignOndemandDetailsController
);

RouterV1Private_Get.get(
  "/campaign/:id",
  removeSubUserUid,
  getCampaignValidation,
  getCampaignController
);

RouterV1Private_Get.get(
  "/campaign/details/:id",
  removeSubUserUid,
  getCampaignDetailsValidation,
  getCampaignDetailsController
);

RouterV1Private_Get.get(
  "/geolocations",
  removeSubUserUid,
  getGeolocationsValidation,
  getGeolocationsController
);

RouterV1Private_Get.get(
  "/geolocations/:id",
  removeSubUserUid,
  getGeolocationValidation,
  getGeolocationController
);

RouterV1Private_Get.get(
  "/geolocations/details/:id",
  removeSubUserUid,
  getGeolocationDetailsValidation,
  getGeolocationDetailsController
);

RouterV1Private_Get.get(
  "/geolocations-options",
  removeSubUserUid,
  getGeolocationForSelectValidation,
  getGeolocationForSelectController
);

RouterV1Private_Get.get(
  "/campaign-audience/:id/export/download",
  removeSubUserUid,
  getFileCampaignAudienceValidation,
  getFileCampaignAudienceController
);

RouterV1Private_Get.get(
  "/campaign-audience/:id/export/link",
  removeSubUserUid,
  getLinkFileCampaignAudienceValidation,
  getLinkFileCampaignAudienceController
);

RouterV1Private_Get.get(
  "/integration-ai-options",
  removeSubUserUid,
  getIntegrationAiForSelectValidation,
  getIntegrationAiForSelectController
);

RouterV1Private_Get.get(
  "/integration-ai/:id",
  removeSubUserUid,
  getIntegrationAiValidation,
  getIntegrationAiController
);

RouterV1Private_Get.get(
  "/integrations-ai",
  removeSubUserUid,
  getIntegrationsAiValidation,
  getIntegrationsAiController
);

RouterV1Private_Get.get(
  "/integrations-ai/details/:id",
  removeSubUserUid,
  getIntegrationAiDetailsValidation,
  getIntegrationAiDetailsController
);

RouterV1Private_Get.get(
  "/attendant-ai/:id",
  removeSubUserUid,
  getAttendantAiValidation,
  getAttendantAiController
);

RouterV1Private_Get.get(
  "/attendant-ai-options",
  removeSubUserUid,
  getAttendantAiForSelectValidation,
  getAttendantAiForSelectController
);

RouterV1Private_Get.get(
  "/attendants-ai",
  removeSubUserUid,
  getAttendantsAiValidation,
  getAttendantsAiController
);

RouterV1Private_Get.get(
  "/attendant-ai/details/:id",
  removeSubUserUid,
  getAttendantAiDetailsValidation,
  getAttendantAiDetailsController
);

RouterV1Private_Get.get(
  "/facebook-integration/:id/business-options",
  removeSubUserUid,
  getBusinessFacebookIntegrationForSelectValidation,
  getBusinessFacebookIntegrationForSelectController
);

RouterV1Private_Get.get(
  "/facebook-integration/:id/pixels-options/:fbBusinessId",
  removeSubUserUid,
  getPixelsFacebookIntegrationForSelectValidation,
  getPixelsFacebookIntegrationForSelectController
);

RouterV1Private_Get.get(
  "/facebook-integrations",
  removeSubUserUid,
  getFacebookIntegrationsValidation,
  getFacebookIntegrationsController
);

RouterV1Private_Get.get(
  "/facebook-integration/:id",
  removeSubUserUid,
  getFacebookIntegrationValidation,
  getFacebookIntegrationController
);

RouterV1Private_Get.get(
  "/facebook-integration/details/:id",
  removeSubUserUid,
  getFacebookIntegrationDetailsValidation,
  getFacebookIntegrationDetailsController
);

RouterV1Private_Get.get(
  "/facebook-integrations-options",
  removeSubUserUid,
  getFacebookIntegrationsForSelectValidation,
  getFacebookIntegrationsForSelectController
);

export default RouterV1Private_Get;
