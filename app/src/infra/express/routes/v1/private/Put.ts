import { NextFunction, Request, Router } from "express";
import { updateBusinessOnAccountController } from "../../../../../core/updateBusinessOnAccount";
import { updateBusinessOnAccountValidation } from "../../../../../core/updateBusinessOnAccount/Validation";
import { updateTagController } from "../../../../../core/updateTag";
import { updateTagValidation } from "../../../../../core/updateTag/Validation";
// import { updateCampaignParameterValidation } from "../../../../../core/updateCampaignParameter/Validation";
// import { updateCampaignParameterController } from "../../../../../core/updateCampaignParameter";
// import multer from "multer";
// import { resolve } from "path";
// import { storageMulter } from "../../../../../adapters/Multer/storage";
// import { updateConnectionWAController } from "../../../../../core/updateConnectionWA";
// import { updateConnectionWAValidation } from "../../../../../core/updateConnectionWA/Validation";
// import { updateConnectionWAUserController } from "../../../../../core/updateConnectionWAUser";
// import { updateConnectionWAUserValidation } from "../../../../../core/updateConnectionWAUser/Validation";
import { updateDataFlowController } from "../../../../../core/updateDataFlow";
import { updateDataFlowValidation } from "../../../../../core/updateDataFlow/Validation";
import { updateDisconnectConnectionWhatsappController } from "../../../../../core/updateDisconnectConnectionWhatsapp";
import { updateDisconnectConnectionWhatsappValidation } from "../../../../../core/updateDisconnectConnectionWhatsapp/Validation";
// import { createImageConnectionUserController } from "../../../../../core/updateImageConnectionWAUser";
// import { createImageConnectionUserValidation } from "../../../../../core/updateImageConnectionWAUser/Validation";
// import { updateReactivateCampaignController } from "../../../../../core/updateReactivateCampaign";
// import { updateReactivateCampaignValidation } from "../../../../../core/updateReactivateCampaign/Validation";
// import { updateStatusCampaignController } from "../../../../../core/updateStatusCampaign";
// import { updateStatusCampaignValidation } from "../../../../../core/updateStatusCampaign/Validation";
// import { updateSupervisorController } from "../../../../../core/updateSupervisor";
// import { updateSupervisorValidation } from "../../../../../core/updateSupervisor/Validation";
// import { VerifySubUserMiddleware } from "../../../../middlewares/verifySubUser";
// import { updateCancelSubscriptionValidation } from "../../../../../core/updateCancelSubscription/Validation";
// import { updateCancelSubscriptionController } from "../../../../../core/updateCancelSubscription";
// import { updateFunnelKanbanADMValidation } from "../../../../../core/updateFunnelKanban/Validation";
// import { updateFunnelKanbanADMController } from "../../../../../core/updateFunnelKanban";
// import { updateSectorsAttendantValidation } from "../../../../../core/updateSectorsAttendant/Validation";
// import { updateSectorsAttendantController } from "../../../../../core/updateSectorsAttendant";
// import { updateSectorValidation } from "../../../../../core/updateSector/Validation";
// import { updateSectorController } from "../../../../../core/updateSector";
import { updateFlowValidation } from "../../../../../core/updateFlow/Validation";
import { updateFlowController } from "../../../../../core/updateFlow";
import { updateVariableValidation } from "../../../../../core/updateVariable/Validation";
import { updateVariableController } from "../../../../../core/updateVariable";
// import { updateCheckpointValidation } from "../../../../../core/updateCheckpoint/Validation";
// import { updateCheckpointController } from "../../../../../core/updateCheckpoint";
// import { updateLinkTackingPixelValidation } from "../../../../../core/updateLinkTackingPixel/Validation";
// import { updateLinkTackingPixelController } from "../../../../../core/updateLinkTackingPixel";
// import { updateCampaignAudienceValidation } from "../../../../../core/updateCampaignAudience/Validation";
// import { updateCampaignAudienceController } from "../../../../../core/updateCampaignAudience";
// import { updateCampaignParameterValidation } from "../../../../../core/updateCampaignParameter/Validation";
// import { updateCampaignParameterController } from "../../../../../core/updateCampaignParameter";
// import { updateCampaignOndemandValidation } from "../../../../../core/updateCampaignOndemand/Validation";
// import { updateCampaignOndemandController } from "../../../../../core/updateCampaignOndemand";
// import { updateCampaignValidation } from "../../../../../core/updateCampaign/Validation";
// import { updateCampaignController } from "../../../../../core/updateCampaign";
import { updateChatbotValidation } from "../../../../../core/updateChatbot/Validation";
import { updateChatbotController } from "../../../../../core/updateChatbot";
import { updateConnectionWAController } from "../../../../../core/updateConnectionWA";
import { updateConnectionWAValidation } from "../../../../../core/updateConnectionWA/Validation";
import { resolve } from "path";
import { storageMulter } from "../../../../../adapters/Multer/storage";
import multer from "multer";
import { updateAccountValidation } from "../../../../../core/updateAccount/Validation";
import { updateAccountController } from "../../../../../core/updateAccount";
// import { updateGeolocationValidation } from "../../../../../core/updateGeolocation/Validation";
// import { updateGeolocationController } from "../../../../../core/updateGeolocation";
// import { updateEmailServiceConfigurationValidation } from "../../../../../core/updateEmailServiceConfiguration/Validation";
// import { updateEmailServiceConfigurationController } from "../../../../../core/updateEmailServiceConfiguration";
// import { updateSubAccountValidation } from "../../../../../core/updateSubAccount/Validation";
// import { updateSubAccountController } from "../../../../../core/updateSubAccount";
// import { updateIntegrationValidation } from "../../../../../core/updateIntegration/Validation";
// import { updateIntegrationController } from "../../../../../core/updateIntegration";
// import { updateIntegrationAiValidation } from "../../../../../core/updateIntegrationAi/Validation";
// import { updateIntegrationAiController } from "../../../../../core/updateIntegrationAi";
// import { updateAttendantAiValidation } from "../../../../../core/updateAttendantAi/Validation";
// import { updateAttendantAiController } from "../../../../../core/updateAttendantAi";
// import { updateFacebookIntegrationValidation } from "../../../../../core/updateFacebookIntegration/Validation";
// import { updateFacebookIntegrationController } from "../../../../../core/updateFacebookIntegration";
// import { updateCustomerValidation } from "../../../../../core/updateCustomer/Validation";
// import { updateCustomerController } from "../../../../../core/updateCustomer";

const RouterV1Private_Put = Router();

RouterV1Private_Put.put("/tags/:id", updateTagValidation, updateTagController);

RouterV1Private_Put.put(
  "/businesses/:id",
  updateBusinessOnAccountValidation,
  updateBusinessOnAccountController
);

// RouterV1Private_Put.put(
//   "/campaign-parameter/:id",
//   updateCampaignParameterValidation,
//   updateCampaignParameterController
// );

RouterV1Private_Put.put(
  "/flows/:id/data",
  updateDataFlowValidation,
  updateDataFlowController
);

// RouterV1Private_Put.put(
//   "/supervisor/:id",
//   updateSupervisorValidation,
//   updateSupervisorController
// );

RouterV1Private_Put.put(
  "/disconnect-connection-whatsapp/:id",
  updateDisconnectConnectionWhatsappValidation,
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
//
//   updateReactivateCampaignController
// );

// RouterV1Private_Put.put(
//   "/status-campaign/:id/:status",
//   updateStatusCampaignValidation,
//   updateStatusCampaignController
// );

const pathOfDestiny = resolve(__dirname, `../../../../../../static`);

const uploadFiles = storageMulter({ pathOfDestiny: pathOfDestiny + "/image" });

RouterV1Private_Put.put(
  "/connections-wa/:id",
  // @ts-expect-error
  multer({ storage: uploadFiles }).single("fileImage"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  updateConnectionWAValidation,
  updateConnectionWAController
);

// const pathOfDestiny = resolve(__dirname, `../../../../../../static/image`);

// RouterV1Private_Put.put(
//   "/connection-whatsapp-user/:id",
//   updateConnectionWAUserValidation,
//   updateConnectionWAUserController
// );

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

// RouterV1Private_Put.put(
//   "/cancel-subscription/:id",
//   updateCancelSubscriptionValidation,
//   updateCancelSubscriptionController
// );

// RouterV1Private_Put.put(
//   "/funil-kanban/:id",
//   updateFunnelKanbanADMValidation,
//   updateFunnelKanbanADMController
// );

// RouterV1Private_Put.put(
//   "/sectors-attendants/:id",
//   updateSectorsAttendantValidation,
//   updateSectorsAttendantController
// );

// RouterV1Private_Put.put(
//   "/sector/:id",
//   updateSectorValidation,
//   updateSectorController
// );

RouterV1Private_Put.put(
  "/flows/:id",
  updateFlowValidation,
  updateFlowController
);

RouterV1Private_Put.put(
  "/variables/:id",
  updateVariableValidation,
  updateVariableController
);

// RouterV1Private_Put.put(
//   "/checkpoint/:id",
//   updateCheckpointValidation,
//   updateCheckpointController
// );

// RouterV1Private_Put.put(
//   "/link-tracking-pixel/:id",
//   updateLinkTackingPixelValidation,
//   updateLinkTackingPixelController
// );

// RouterV1Private_Put.put(
//   "/campaign-audience/:id",
//   updateCampaignAudienceValidation,
//   updateCampaignAudienceController
// );

// RouterV1Private_Put.put(
//   "/campaign-ondemand/:id",
//   updateCampaignOndemandValidation,
//   updateCampaignOndemandController
// );

// RouterV1Private_Put.put(
//   "/campaign/:id",
//   updateCampaignValidation,
//   updateCampaignController
// );

RouterV1Private_Put.put(
  "/chatbots/:id",
  updateChatbotValidation,
  updateChatbotController
);

// RouterV1Private_Put.put(
//   "/geolocation/:id",
//   updateGeolocationValidation,
//   updateGeolocationController
// );

// RouterV1Private_Put.put(
//   "/email-service-configuration/:id",
//   updateEmailServiceConfigurationValidation,
//   updateEmailServiceConfigurationController
// );

// RouterV1Private_Put.put(
//   "/sub-user/:id",
//   updateSubAccountValidation,
//   updateSubAccountController
// );

// RouterV1Private_Put.put(
//   "/integration/:id",
//   updateIntegrationValidation,
//   updateIntegrationController
// );

// RouterV1Private_Put.put(
//   "/integration-ai/:id",
//   updateIntegrationAiValidation,
//   updateIntegrationAiController
// );

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
//
//   updateAttendantAiValidation,
//   updateAttendantAiController
// );

// RouterV1Private_Put.put(
//   "/facebook-integration/:id",
//   updateFacebookIntegrationValidation,
//   updateFacebookIntegrationController
// );

// RouterV1Private_Put.put(
//   "/customer",
//   updateCustomerValidation,
//   updateCustomerController
// );

RouterV1Private_Put.put(
  "/account",
  updateAccountValidation,
  updateAccountController
);

export default RouterV1Private_Put;
