import { Router } from "express";
// import { deleteBatchBusinessOnAccountController } from "../../../../../core/deleteBatchBusinessOnAccount";
// import { deleteBatchBusinessOnAccountValidation } from "../../../../../core/deleteBatchBusinessOnAccount/Validation";
// import { deleteBatchSupervisorController } from "../../../../../core/deleteBatchSupervisors";
// import { deleteBatchSupervisorValidation } from "../../../../../core/deleteBatchSupervisors/Validation";
import { deleteBusinessOnAccountController } from "../../../../../core/deleteBusinessOnAccount";
import { deleteBusinessOnAccountValidation } from "../../../../../core/deleteBusinessOnAccount/Validation";
// import { deleteCampaignController } from "../../../../../core/deleteCampaign";
// import { deleteCampaignValidation } from "../../../../../core/deleteCampaign/Validation";
// import { deleteCampaignAudienceController } from "../../../../../core/deleteCampaignAudience";
// import { deleteCampaignAudienceValidation } from "../../../../../core/deleteCampaignAudience/Validation";
// import { deleteCampaignParameterController } from "../../../../../core/deleteCampaignParameter";
// import { deleteCampaignParameterValidation } from "../../../../../core/deleteCampaignParameter/Validation";
import { deleteChatbotController } from "../../../../../core/deleteChatbot";
import { deleteChatbotValidation } from "../../../../../core/deleteChatbot/Validation";
// import { deleteCheckpointController } from "../../../../../core/deleteCheckpoint";
import { deleteConnectionWhatsappController } from "../../../../../core/deleteConnectionWhatsapp";
import { deleteConnectionWhatsappValidation } from "../../../../../core/deleteConnectionWhatsapp/Validation";
// import { deleteEmailServiceConfigurationController } from "../../../../../core/deleteEmailServiceConfiguration";
// import { deleteEmailServiceConfigurationValidation } from "../../../../../core/deleteEmailServiceConfiguration/Validation";
import { deleteFlowController } from "../../../../../core/deleteFlow";
import { deleteFlowValidation } from "../../../../../core/deleteFlow/Validation";
// import { deleteIntegrationController } from "../../../../../core/deleteIntegration";
// import { deleteIntegrationValidation } from "../../../../../core/deleteIntegration/Validation";
// import { deleteLinkTackingPixelController } from "../../../../../core/deleteLinkTackingPixel";
// import { deleteLinkTackingPixelValidation } from "../../../../../core/deleteLinkTackingPixel/Validation";
// import { deleteSectorController } from "../../../../../core/deleteSector";
// import { deleteSectorValidation } from "../../../../../core/deleteSector/Validation";
// import { deleteSectorAttendantController } from "../../../../../core/deleteSectorAttendant";
// import { deleteSectorAttendantValidation } from "../../../../../core/deleteSectorAttendant/Validation";
// import { deleteSubAccountController } from "../../../../../core/deleteSubAccount";
// import { deleteSubAccountValidation } from "../../../../../core/deleteSubAccount/Validation";
// import { deleteSupervisorController } from "../../../../../core/deleteSupervisors";
// import { deleteSupervisorValidation } from "../../../../../core/deleteSupervisors/Validation";
import { deleteTagController } from "../../../../../core/deleteTag";
import { deleteTagValidation } from "../../../../../core/deleteTag/Validation";
import { deleteVariableController } from "../../../../../core/deleteVariables";
import { deleteVariableValidation } from "../../../../../core/deleteVariables/Validation";
// import { VerifySubUserMiddleware } from "../../../../middlewares/verifySubUser";
// import { deleteCreditCardValidation } from "../../../../../core/deleteCreditCard/Validation";
// import { deleteCreditCardController } from "../../../../../core/deleteCreditCard";
// import { deleteKanbanController } from "../../../../../core/deleteKanban";
// import { deleteKanbanValidation } from "../../../../../core/deleteKanban/Validation";
// import { deleteContactOnCampaignAudienceValidation } from "../../../../../core/deleteContactOnCampaignAudience/Validation";
// import { deleteContactOnCampaignAudienceController } from "../../../../../core/deleteContactOnCampaignAudience";
// import { deleteGeolocationValidation } from "../../../../../core/deleteGeolocation/Validation";
// import { deleteGeolocationController } from "../../../../../core/deleteGeolocation";
// import { deleteStaticFileValidation } from "../../../../../core/deleteStaticFile/Validation";
// import { deleteStaticFileController } from "../../../../../core/deleteStaticFile";
// import { deleteIntegrationAiValidation } from "../../../../../core/deleteIntegrationAi/Validation";
// import { deleteIntegrationAiController } from "../../../../../core/deleteIntegrationAi";
// import { deleteAtendantAiValidation } from "../../../../../core/deleteAttendantAi/Validation";
// import { deleteAtendantAiController } from "../../../../../core/deleteAttendantAi";
// import { deleteFacebookIntegrationValidation } from "../../../../../core/deleteFacebookIntegration/Validation";
// import { deleteFacebookIntegrationController } from "../../../../../core/deleteFacebookIntegration";

const RouterV1Private_Delete = Router();

RouterV1Private_Delete.delete(
  "/tags/:id",
  deleteTagValidation,
  deleteTagController
);

RouterV1Private_Delete.delete(
  "/business/:id",
  deleteBusinessOnAccountValidation,
  deleteBusinessOnAccountController
);

// RouterV1Private_Delete.delete(
//   "/batch/business/:batch",
//   deleteBatchBusinessOnAccountValidation,
//   deleteBatchBusinessOnAccountController
// );

// RouterV1Private_Delete.delete(
//   "/campaign-parameter/:id",
//   deleteCampaignParameterValidation,
//   deleteCampaignParameterController
// );

// RouterV1Private_Delete.delete(
//   "/campaign-audience/:id",
//   deleteCampaignAudienceValidation,
//   deleteCampaignAudienceController
// );

// RouterV1Private_Delete.delete(
//   "/campaign/:id",
//   deleteCampaignValidation,
//   deleteCampaignController
// );

RouterV1Private_Delete.delete(
  "/variables/:id",
  deleteVariableValidation,
  deleteVariableController
);

// RouterV1Private_Delete.delete(
//   "/supervisor/:id",
//   deleteSupervisorValidation,
//   deleteSupervisorController
// );
// RouterV1Private_Delete.delete(
//   "/batch/supervisor/:batch",
//   deleteBatchSupervisorValidation,
//   deleteBatchSupervisorController
// );

// RouterV1Private_Delete.delete(
//   "/sector-attendant/:id",
//   deleteSectorAttendantValidation,
//   deleteSectorAttendantController
// );

// RouterV1Private_Delete.delete(
//   "/sector/:id",
//   deleteSectorValidation,
//   deleteSectorController
// );

RouterV1Private_Delete.delete(
  "/flows/:flowId",
  deleteFlowValidation,
  deleteFlowController
);

RouterV1Private_Delete.delete(
  "/connection-whatsapp/:id",
  deleteConnectionWhatsappValidation,
  deleteConnectionWhatsappController
);

// RouterV1Private_Delete.delete(
//   "/email-service-configuration/:id",
//   deleteEmailServiceConfigurationValidation,
//   deleteEmailServiceConfigurationController
// );

// RouterV1Private_Delete.delete(
//   "/link-tracking-pixel/:id",
//   deleteLinkTackingPixelValidation,
//   deleteLinkTackingPixelController
// );

RouterV1Private_Delete.delete(
  "/chatbot/:id",
  deleteChatbotValidation,
  deleteChatbotController
);

// RouterV1Private_Delete.delete(
//   "/integration/:id",
//   deleteIntegrationValidation,
//   deleteIntegrationController
// );

// RouterV1Private_Delete.delete(
//   "/sub-user/:id",
//   deleteSubAccountValidation,
//   (req, res, next) =>
//     VerifySubUserMiddleware(req, res, next, {
//       type: "Delete",
//       entity: "users",
//     }),

//   deleteSubAccountController
// );

// RouterV1Private_Delete.delete(
//   "/checkpoint/:id",
//   deleteIntegrationValidation,
//   (req, res, next) =>
//     VerifySubUserMiddleware(req, res, next, {
//       type: "Delete",
//       entity: "checkpoint",
//     }),

//   deleteCheckpointController
// );

// RouterV1Private_Delete.delete(
//   "/credit-card/:id",

//   deleteCreditCardValidation,
//   deleteCreditCardController
// );

// RouterV1Private_Delete.delete(
//   "/kanban/:id",

//   deleteKanbanValidation,
//   deleteKanbanController
// );

// RouterV1Private_Delete.delete(
//   "/contact-campaign-audience/:id/:audienceId",

//   deleteContactOnCampaignAudienceValidation,
//   deleteContactOnCampaignAudienceController
// );

// RouterV1Private_Delete.delete(
//   "/geolocation/:id",

//   deleteGeolocationValidation,
//   deleteGeolocationController
// );

// RouterV1Private_Delete.delete(
//   "/static-file/:id",

//   deleteStaticFileValidation,
//   deleteStaticFileController
// );

// RouterV1Private_Delete.delete(
//   "/integration-ai/:id",

//   deleteIntegrationAiValidation,
//   deleteIntegrationAiController
// );

// RouterV1Private_Delete.delete(
//   "/attendant-ai/:id",

//   deleteAtendantAiValidation,
//   deleteAtendantAiController
// );

// RouterV1Private_Delete.delete(
//   "/facebook-integration/:id",

//   deleteFacebookIntegrationValidation,
//   deleteFacebookIntegrationController
// );

export default RouterV1Private_Delete;
