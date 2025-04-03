import { NextFunction, Request, Response, Router } from "express";
import { updateBusinessOnAccountController } from "../../../../../core/updateBusinessOnAccount";
import { updateBusinessOnAccountValidation } from "../../../../../core/updateBusinessOnAccount/Validation";
import { updateTagController } from "../../../../../core/updateTag";
import { updateTagValidation } from "../../../../../core/updateTag/Validation";
// import { updateCampaignParameterValidation } from "../../../../../core/updateCampaignParameter/Validation";
// import { updateCampaignParameterController } from "../../../../../core/updateCampaignParameter";
// import multer from "multer";
// import { resolve } from "path";
// import { storageMulter } from "../../../../../adapters/Multer/storage";
import { updateConnectionWAController } from "../../../../../core/updateConnectionWA";
import { updateConnectionWAValidation } from "../../../../../core/updateConnectionWA/Validation";
import { updateConnectionWAUserController } from "../../../../../core/updateConnectionWAUser";
import { updateConnectionWAUserValidation } from "../../../../../core/updateConnectionWAUser/Validation";
import { updateDataFlowController } from "../../../../../core/updateDataFlow";
import { updateDataFlowValidation } from "../../../../../core/updateDataFlow/Validation";
import { updateDisconnectConnectionWhatsappController } from "../../../../../core/updateDisconnectConnectionWhatsapp";
import { updateDisconnectConnectionWhatsappValidation } from "../../../../../core/updateDisconnectConnectionWhatsapp/Validation";
// import { createImageConnectionUserController } from "../../../../../core/updateImageConnectionWAUser";
// import { createImageConnectionUserValidation } from "../../../../../core/updateImageConnectionWAUser/Validation";
// import { updateReactivateCampaignController } from "../../../../../core/updateReactivateCampaign";
// import { updateReactivateCampaignValidation } from "../../../../../core/updateReactivateCampaign/Validation";
import { updateStatusCampaignController } from "../../../../../core/updateStatusCampaign";
import { updateStatusCampaignValidation } from "../../../../../core/updateStatusCampaign/Validation";
import { updateSupervisorController } from "../../../../../core/updateSupervisor";
import { updateSupervisorValidation } from "../../../../../core/updateSupervisor/Validation";
import { VerifySubUserMiddleware } from "../../../../middlewares/verifySubUser";
import { updateCancelSubscriptionValidation } from "../../../../../core/updateCancelSubscription/Validation";
import { updateCancelSubscriptionController } from "../../../../../core/updateCancelSubscription";
import { updateFunnelKanbanADMValidation } from "../../../../../core/updateFunnelKanban/Validation";
import { updateFunnelKanbanADMController } from "../../../../../core/updateFunnelKanban";
import { updateSectorsAttendantValidation } from "../../../../../core/updateSectorsAttendant/Validation";
import { updateSectorsAttendantController } from "../../../../../core/updateSectorsAttendant";
import { updateSectorValidation } from "../../../../../core/updateSector/Validation";
import { updateSectorController } from "../../../../../core/updateSector";
import { updateFlowValidation } from "../../../../../core/updateFlow/Validation";
import { updateFlowController } from "../../../../../core/updateFlow";
import { updateVariableBusinessValidation } from "../../../../../core/updateVariable/Validation";
import { updateVariableBusinessController } from "../../../../../core/updateVariable";
import { updateCheckpointValidation } from "../../../../../core/updateCheckpoint/Validation";
import { updateCheckpointController } from "../../../../../core/updateCheckpoint";
import { updateLinkTackingPixelValidation } from "../../../../../core/updateLinkTackingPixel/Validation";
import { updateLinkTackingPixelController } from "../../../../../core/updateLinkTackingPixel";
import { updateCampaignAudienceValidation } from "../../../../../core/updateCampaignAudience/Validation";
import { updateCampaignAudienceController } from "../../../../../core/updateCampaignAudience";
import { updateCampaignParameterValidation } from "../../../../../core/updateCampaignParameter/Validation";
import { updateCampaignParameterController } from "../../../../../core/updateCampaignParameter";
import { updateCampaignOndemandValidation } from "../../../../../core/updateCampaignOndemand/Validation";
import { updateCampaignOndemandController } from "../../../../../core/updateCampaignOndemand";
import { updateCampaignValidation } from "../../../../../core/updateCampaign/Validation";
import { updateCampaignController } from "../../../../../core/updateCampaign";
import { updateChatbotValidation } from "../../../../../core/updateChatbot/Validation";
import { updateChatbotController } from "../../../../../core/updateChatbot";
import { updateGeolocationValidation } from "../../../../../core/updateGeolocation/Validation";
import { updateGeolocationController } from "../../../../../core/updateGeolocation";
import { updateEmailServiceConfigurationValidation } from "../../../../../core/updateEmailServiceConfiguration/Validation";
import { updateEmailServiceConfigurationController } from "../../../../../core/updateEmailServiceConfiguration";
import { updateSubAccountValidation } from "../../../../../core/updateSubAccount/Validation";
import { updateSubAccountController } from "../../../../../core/updateSubAccount";
import { updateIntegrationValidation } from "../../../../../core/updateIntegration/Validation";
import { updateIntegrationController } from "../../../../../core/updateIntegration";
import { updateIntegrationAiValidation } from "../../../../../core/updateIntegrationAi/Validation";
import { updateIntegrationAiController } from "../../../../../core/updateIntegrationAi";
// import { updateAttendantAiValidation } from "../../../../../core/updateAttendantAi/Validation";
// import { updateAttendantAiController } from "../../../../../core/updateAttendantAi";
import { updateFacebookIntegrationValidation } from "../../../../../core/updateFacebookIntegration/Validation";
import { updateFacebookIntegrationController } from "../../../../../core/updateFacebookIntegration";
import { updateCustomerValidation } from "../../../../../core/updateCustomer/Validation";
import { updateCustomerController } from "../../../../../core/updateCustomer";

const RouterV1Private_Put = Router();

const removeSubUserUid = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { subUserUid, ...reqb } = req.body;
  req.body = reqb;
  return next();
};

RouterV1Private_Put.put(
  "/tag/:id",
  updateTagValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "tags",
    }),
  removeSubUserUid,
  updateTagController
);

RouterV1Private_Put.put(
  "/businesses/:id",
  updateBusinessOnAccountValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "business",
    }),
  removeSubUserUid,
  updateBusinessOnAccountController
);

RouterV1Private_Put.put(
  "/campaign-parameter/:id",
  updateCampaignParameterValidation,
  updateCampaignParameterController
);

RouterV1Private_Put.put(
  "/flow-data/:id",
  updateDataFlowValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "dataFlow",
    }),
  removeSubUserUid,
  updateDataFlowController
);

RouterV1Private_Put.put(
  "/supervisor/:id",
  updateSupervisorValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "supervisors",
    }),
  removeSubUserUid,
  updateSupervisorController
);

RouterV1Private_Put.put(
  "/disconnect-connection-whatsapp/:id",
  updateDisconnectConnectionWhatsappValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "connections",
    }),
  removeSubUserUid,
  updateDisconnectConnectionWhatsappController
);

// RouterV1Private_Put.put(
//   "/reactivate-campaign/:id",
//   updateReactivateCampaignValidation,
//   (req, res, next) =>
//     VerifySubUserMiddleware(req, res, next, {
//       type: "Update",
//       entity: "campaign",
//     }),
//   removeSubUserUid,
//   updateReactivateCampaignController
// );

RouterV1Private_Put.put(
  "/status-campaign/:id/:status",
  updateStatusCampaignValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "campaign",
    }),
  removeSubUserUid,
  updateStatusCampaignController
);

RouterV1Private_Put.put(
  "/connection-whatsapp/:id",
  updateConnectionWAValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "connections",
    }),
  removeSubUserUid,
  updateConnectionWAController
);

// const pathOfDestiny = resolve(__dirname, `../../../../../../static/image`);

RouterV1Private_Put.put(
  "/connection-whatsapp-user/:id",
  updateConnectionWAUserValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "connections",
    }),
  removeSubUserUid,
  updateConnectionWAUserController
);

// RouterV1Private_Put.put(
//   "/connection-whatsapp-user-image/:id",
//   (req: Request<any>, res: any, next: any) =>
//     multer({
//       storage: storageMulter({ pathOfDestiny }),
//     }).single("upload_file")(req, res, next),
//   (req, res, next) => {
//     if (req.file) {
//       req.body = {
//         accountId: Number(req.headers.authorization),
//         // @ts-expect-error
//         id: req.params.id,
//         fileName: req.file.filename,
//       };
//       next();
//     } else {
//       return res.status(400).json({
//         message: "Error pra salvar a imagem",
//         status: 400,
//       });
//     }
//   },
//   createImageConnectionUserValidation,
//   createImageConnectionUserController
// );

RouterV1Private_Put.put(
  "/cancel-subscription/:id",
  removeSubUserUid,
  updateCancelSubscriptionValidation,
  updateCancelSubscriptionController
);

RouterV1Private_Put.put(
  "/funil-kanban/:id",
  removeSubUserUid,
  updateFunnelKanbanADMValidation,
  updateFunnelKanbanADMController
);

RouterV1Private_Put.put(
  "/sectors-attendants/:id",
  updateSectorsAttendantValidation,
  (req, res, next) =>
    VerifySubUserMiddleware(req, res, next, {
      type: "Update",
      entity: "sectorAttendants",
    }),
  removeSubUserUid,
  updateSectorsAttendantController
);

RouterV1Private_Put.put(
  "/sector/:id",
  removeSubUserUid,
  updateSectorValidation,
  updateSectorController
);

RouterV1Private_Put.put(
  "/flow/:id",
  removeSubUserUid,
  updateFlowValidation,
  updateFlowController
);

RouterV1Private_Put.put(
  "/variable/:id",
  removeSubUserUid,
  updateVariableBusinessValidation,
  updateVariableBusinessController
);

RouterV1Private_Put.put(
  "/checkpoint/:id",
  removeSubUserUid,
  updateCheckpointValidation,
  updateCheckpointController
);

RouterV1Private_Put.put(
  "/link-tracking-pixel/:id",
  removeSubUserUid,
  updateLinkTackingPixelValidation,
  updateLinkTackingPixelController
);

RouterV1Private_Put.put(
  "/campaign-audience/:id",
  removeSubUserUid,
  updateCampaignAudienceValidation,
  updateCampaignAudienceController
);

RouterV1Private_Put.put(
  "/campaign-ondemand/:id",
  removeSubUserUid,
  updateCampaignOndemandValidation,
  updateCampaignOndemandController
);

RouterV1Private_Put.put(
  "/campaign/:id",
  removeSubUserUid,
  updateCampaignValidation,
  updateCampaignController
);

RouterV1Private_Put.put(
  "/chatbot/:id",
  removeSubUserUid,
  updateChatbotValidation,
  updateChatbotController
);

RouterV1Private_Put.put(
  "/geolocation/:id",
  removeSubUserUid,
  updateGeolocationValidation,
  updateGeolocationController
);

RouterV1Private_Put.put(
  "/email-service-configuration/:id",
  removeSubUserUid,
  updateEmailServiceConfigurationValidation,
  updateEmailServiceConfigurationController
);

RouterV1Private_Put.put(
  "/sub-user/:id",
  removeSubUserUid,
  updateSubAccountValidation,
  updateSubAccountController
);

RouterV1Private_Put.put(
  "/integration/:id",
  removeSubUserUid,
  updateIntegrationValidation,
  updateIntegrationController
);

RouterV1Private_Put.put(
  "/integration-ai/:id",
  removeSubUserUid,
  updateIntegrationAiValidation,
  updateIntegrationAiController
);

// const uploadFiles = multer({
//   storage: storageMulter({
//     pathOfDestiny: resolve(__dirname, `../../../../../../static/file`),
//   }),
// });

// RouterV1Private_Put.put(
//   "/attendant-ai",
//   uploadFiles.array("files"),
//   (req, res, next) => {
//     req.body = {
//       ...req.body,
//       aiId: req.body.aiId ? Number(req.body.aiId) : undefined,
//       accountId: Number(req.headers.authorization),
//       ...(req.files?.length && {
//         files: Array.isArray(req.files)
//           ? req.files.map(({ filename, originalname }) => ({
//               filename,
//               originalname,
//             }))
//           : [],
//       }),
//     };
//     next();
//   },
//   removeSubUserUid,
//   updateAttendantAiValidation,
//   updateAttendantAiController
// );

RouterV1Private_Put.put(
  "/facebook-integration/:id",
  removeSubUserUid,
  updateFacebookIntegrationValidation,
  updateFacebookIntegrationController
);

RouterV1Private_Put.put(
  "/customer",
  removeSubUserUid,
  updateCustomerValidation,
  updateCustomerController
);

export default RouterV1Private_Put;
