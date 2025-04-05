import { NextFunction, Request, Response, Router } from "express";
import { deleteBatchBusinessOnAccountController } from "../../../../../core/deleteBatchBusinessOnAccount";
import { deleteBatchBusinessOnAccountValidation } from "../../../../../core/deleteBatchBusinessOnAccount/Validation";
import { deleteBatchSupervisorController } from "../../../../../core/deleteBatchSupervisors";
import { deleteBatchSupervisorValidation } from "../../../../../core/deleteBatchSupervisors/Validation";
import { deleteBusinessOnAccountController } from "../../../../../core/deleteBusinessOnAccount";
import { deleteBusinessOnAccountValidation } from "../../../../../core/deleteBusinessOnAccount/Validation";
import { deleteCampaignController } from "../../../../../core/deleteCampaign";
import { deleteCampaignValidation } from "../../../../../core/deleteCampaign/Validation";
import { deleteCampaignAudienceController } from "../../../../../core/deleteCampaignAudience";
import { deleteCampaignAudienceValidation } from "../../../../../core/deleteCampaignAudience/Validation";
import { deleteCampaignParameterController } from "../../../../../core/deleteCampaignParameter";
import { deleteCampaignParameterValidation } from "../../../../../core/deleteCampaignParameter/Validation";
import { deleteChatbotController } from "../../../../../core/deleteChatbot";
import { deleteChatbotValidation } from "../../../../../core/deleteChatbot/Validation";
import { deleteCheckpointController } from "../../../../../core/deleteCheckpoint";
import { deleteConnectionWhatsappController } from "../../../../../core/deleteConnectionWhatsapp";
import { deleteConnectionWhatsappValidation } from "../../../../../core/deleteConnectionWhatsapp/Validation";
import { deleteEmailServiceConfigurationController } from "../../../../../core/deleteEmailServiceConfiguration";
import { deleteEmailServiceConfigurationValidation } from "../../../../../core/deleteEmailServiceConfiguration/Validation";
import { deleteFlowController } from "../../../../../core/deleteFlow";
import { deleteFlowValidation } from "../../../../../core/deleteFlow/Validation";
import { deleteIntegrationController } from "../../../../../core/deleteIntegration";
import { deleteIntegrationValidation } from "../../../../../core/deleteIntegration/Validation";
import { deleteLinkTackingPixelController } from "../../../../../core/deleteLinkTackingPixel";
import { deleteLinkTackingPixelValidation } from "../../../../../core/deleteLinkTackingPixel/Validation";
import { deleteSectorController } from "../../../../../core/deleteSector";
import { deleteSectorValidation } from "../../../../../core/deleteSector/Validation";
import { deleteSectorAttendantController } from "../../../../../core/deleteSectorAttendant";
import { deleteSectorAttendantValidation } from "../../../../../core/deleteSectorAttendant/Validation";
import { deleteSubAccountController } from "../../../../../core/deleteSubAccount";
import { deleteSubAccountValidation } from "../../../../../core/deleteSubAccount/Validation";
import { deleteSupervisorController } from "../../../../../core/deleteSupervisors";
import { deleteSupervisorValidation } from "../../../../../core/deleteSupervisors/Validation";
import { deleteTagOnBusinessController } from "../../../../../core/deleteTagOnBusiness";
import { deleteTagOnBusinessValidation } from "../../../../../core/deleteTagOnBusiness/Validation";
import { deleteVariableController } from "../../../../../core/deleteVariables";
import { deleteVariableValidation } from "../../../../../core/deleteVariables/Validation";
import { VerifySubUserMiddleware } from "../../../../middlewares/verifySubUser";
import { deleteCreditCardValidation } from "../../../../../core/deleteCreditCard/Validation";
import { deleteCreditCardController } from "../../../../../core/deleteCreditCard";
import { deleteKanbanController } from "../../../../../core/deleteKanban";
import { deleteKanbanValidation } from "../../../../../core/deleteKanban/Validation";
import { deleteContactOnCampaignAudienceValidation } from "../../../../../core/deleteContactOnCampaignAudience/Validation";
import { deleteContactOnCampaignAudienceController } from "../../../../../core/deleteContactOnCampaignAudience";
import { deleteGeolocationValidation } from "../../../../../core/deleteGeolocation/Validation";
import { deleteGeolocationController } from "../../../../../core/deleteGeolocation";
import { deleteStaticFileValidation } from "../../../../../core/deleteStaticFile/Validation";
import { deleteStaticFileController } from "../../../../../core/deleteStaticFile";
import { deleteIntegrationAiValidation } from "../../../../../core/deleteIntegrationAi/Validation";
import { deleteIntegrationAiController } from "../../../../../core/deleteIntegrationAi";
import { deleteAtendantAiValidation } from "../../../../../core/deleteAttendantAi/Validation";
import { deleteAtendantAiController } from "../../../../../core/deleteAttendantAi";
import { deleteFacebookIntegrationValidation } from "../../../../../core/deleteFacebookIntegration/Validation";
import { deleteFacebookIntegrationController } from "../../../../../core/deleteFacebookIntegration";

const RouterV1Private_Delete = Router();

const removeSubUserUid = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { subUserUid, ...reqb } = req.body;
  req.body = reqb;
  return next();
};

RouterV1Private_Delete.delete(
  "/tag/:tagOnBusinessId",
  deleteTagOnBusinessValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "tags",
    }),
  removeSubUserUid,
  deleteTagOnBusinessController
);

RouterV1Private_Delete.delete(
  "/business/:id",
  deleteBusinessOnAccountValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "business",
    }),
  removeSubUserUid,
  deleteBusinessOnAccountController
);

RouterV1Private_Delete.delete(
  "/batch/business/:batch",
  deleteBatchBusinessOnAccountValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "business",
    }),
  removeSubUserUid,
  deleteBatchBusinessOnAccountController
);

RouterV1Private_Delete.delete(
  "/campaign-parameter/:id",
  deleteCampaignParameterValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "campaignParameters",
    }),
  removeSubUserUid,
  deleteCampaignParameterController
);

RouterV1Private_Delete.delete(
  "/campaign-audience/:id",
  deleteCampaignAudienceValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "campaignAudience",
    }),
  removeSubUserUid,
  deleteCampaignAudienceController
);

RouterV1Private_Delete.delete(
  "/campaign/:id",
  deleteCampaignValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "campaign",
    }),
  removeSubUserUid,
  deleteCampaignController
);

RouterV1Private_Delete.delete(
  "/variable/:variableId",
  deleteVariableValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "variables",
    }),
  removeSubUserUid,
  deleteVariableController
);

RouterV1Private_Delete.delete(
  "/supervisor/:id",
  deleteSupervisorValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "supervisors",
    }),
  removeSubUserUid,
  deleteSupervisorController
);
RouterV1Private_Delete.delete(
  "/batch/supervisor/:batch",
  deleteBatchSupervisorValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "supervisors",
    }),
  removeSubUserUid,
  deleteBatchSupervisorController
);

RouterV1Private_Delete.delete(
  "/sector-attendant/:id",
  deleteSectorAttendantValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "sectorAttendants",
    }),
  removeSubUserUid,
  deleteSectorAttendantController
);

RouterV1Private_Delete.delete(
  "/sector/:id",
  deleteSectorValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "sector",
    }),
  removeSubUserUid,
  deleteSectorController
);

RouterV1Private_Delete.delete(
  "/flows/:flowId",
  deleteFlowValidation,
  deleteFlowController
);

RouterV1Private_Delete.delete(
  "/connection-whatsapp/:id",
  deleteConnectionWhatsappValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "connections",
    }),
  removeSubUserUid,
  deleteConnectionWhatsappController
);

RouterV1Private_Delete.delete(
  "/email-service-configuration/:id",
  deleteEmailServiceConfigurationValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "emailService",
    }),
  removeSubUserUid,
  deleteEmailServiceConfigurationController
);

RouterV1Private_Delete.delete(
  "/link-tracking-pixel/:id",
  deleteLinkTackingPixelValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "customizationLink",
    }),
  removeSubUserUid,
  deleteLinkTackingPixelController
);

RouterV1Private_Delete.delete(
  "/chatbot/:id",
  deleteChatbotValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "chatbot",
    }),
  removeSubUserUid,
  deleteChatbotController
);

RouterV1Private_Delete.delete(
  "/integration/:id",
  deleteIntegrationValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "integration",
    }),
  removeSubUserUid,
  deleteIntegrationController
);

RouterV1Private_Delete.delete(
  "/sub-user/:id",
  deleteSubAccountValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "users",
    }),
  removeSubUserUid,
  deleteSubAccountController
);

RouterV1Private_Delete.delete(
  "/checkpoint/:id",
  deleteIntegrationValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Delete",
      entity: "checkpoint",
    }),
  removeSubUserUid,
  deleteCheckpointController
);

RouterV1Private_Delete.delete(
  "/credit-card/:id",
  removeSubUserUid,
  deleteCreditCardValidation,
  deleteCreditCardController
);

RouterV1Private_Delete.delete(
  "/kanban/:id",
  removeSubUserUid,
  deleteKanbanValidation,
  deleteKanbanController
);

RouterV1Private_Delete.delete(
  "/contact-campaign-audience/:id/:audienceId",
  removeSubUserUid,
  deleteContactOnCampaignAudienceValidation,
  deleteContactOnCampaignAudienceController
);

RouterV1Private_Delete.delete(
  "/geolocation/:id",
  removeSubUserUid,
  deleteGeolocationValidation,
  deleteGeolocationController
);

RouterV1Private_Delete.delete(
  "/static-file/:id",
  removeSubUserUid,
  deleteStaticFileValidation,
  deleteStaticFileController
);

RouterV1Private_Delete.delete(
  "/integration-ai/:id",
  removeSubUserUid,
  deleteIntegrationAiValidation,
  deleteIntegrationAiController
);

RouterV1Private_Delete.delete(
  "/attendant-ai/:id",
  removeSubUserUid,
  deleteAtendantAiValidation,
  deleteAtendantAiController
);

RouterV1Private_Delete.delete(
  "/facebook-integration/:id",
  removeSubUserUid,
  deleteFacebookIntegrationValidation,
  deleteFacebookIntegrationController
);

export default RouterV1Private_Delete;
