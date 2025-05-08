// import { TypeStaticPath } from "@prisma/client";
import { NextFunction, Request, Router } from "express";
// import multer from "multer";
// import { resolve } from "path";
// import { storageMulter } from "../../../../../adapters/Multer/storage";
// import { createAggregationCampaignAudienceController } from "../../../../../core/createAggregationCampaignAudience";
// import { createAggregationCampaignAudienceValidation } from "../../../../../core/createAggregationCampaignAudience/Validation";
// import { createAuthorizationAccountController } from "../../../../../core/createAuthorizationAccount";
// import { createAuthorizationAccountValidation } from "../../../../../core/createAuthorizationAccount/Validation";
import { createBusinessController } from "../../../../../core/createBusiness";
import { createBusinessValidation } from "../../../../../core/createBusiness/Validation";
// import { createBuyExtraPackageController } from "../../../../../core/createBuyExtraPackage";
// import { createBuyExtraPackageValidation } from "../../../../../core/createBuyExtraPackage/Validation";
// import { createBuyPlanController } from "../../../../../core/createBuyPlan";
// import { createBuyPlanValidation } from "../../../../../core/createBuyPlan/Validation";
// import { createCampaignController } from "../../../../../core/createCampaign";
// import { createCampaignValidation } from "../../../../../core/createCampaign/Validation";
// import { createParameterController } from "../../../../../core/createCampaignParameter";
// import { createParameterValidation } from "../../../../../core/createCampaignParameter/Validation";
import { createChatbotController } from "../../../../../core/createChatbot";
import { createChatbotValidation } from "../../../../../core/createChatbot/Validation";
// import { createCheckPointController } from "../../../../../core/createCheckPoint";
// import { createCheckPointValidation } from "../../../../../core/createCheckPoint/Validation";
import { createConnectionWAController } from "../../../../../core/createConnectionWhatsapp";
import { createConnectionWAValidation } from "../../../../../core/createConnectionWhatsapp/Validation";
// import { createContactWAOnAccountController } from "../../../../../core/createContactWAOnAccount";
// import { createContactWAOnAccountValidation } from "../../../../../core/createContactWAOnAccount/Validation";
// import { createEmailServiceConfigurationController } from "../../../../../core/createEmailServiceConfiguration";
// import { createEmailServiceConfigurationValidation } from "../../../../../core/createEmailServiceConfiguration/Validation";
import { createFlowController } from "../../../../../core/createFlow";
import { createFlowValidation } from "../../../../../core/createFlow/Validation";
// import { createIntegrationController } from "../../../../../core/createIntegration";
// import { createIntegrationValidation } from "../../../../../core/createIntegration/Validation";
// import { createInteractionsCampaignAudienceController } from "../../../../../core/createInteractionsCampaignAudience";
// import { createInteractionsCampaignAudienceValidation } from "../../../../../core/createInteractionsCampaignAudience/Validation";
// import { createKanbanController } from "../../../../../core/createKanban";
// import { createKanbanValidation } from "../../../../../core/createKanban/Validation";
// import { createLinkTackingPixelController } from "../../../../../core/createLinkTackingPixel";
// import { createLinkTackingPixelValidation } from "../../../../../core/createLinkTackingPixel/Validation";
// import { createOnDemandAudienceController } from "../../../../../core/createOnDemandAudience";
// import { createOnDemandAudienceValidation } from "../../../../../core/createOnDemandAudience/Validation";
// import { createSectorController } from "../../../../../core/createSector";
// import { createSectorValidation } from "../../../../../core/createSector/Validation";
// import { createSectorAttendantController } from "../../../../../core/createSectorAttendant";
// import { createSectorAttendantValidation } from "../../../../../core/createSectorAttendant/Validation";
// import { createStaticCampaignAudienceController } from "../../../../../core/createStaticCampaignAudience";
// import { createStaticCampaignAudienceValidation } from "../../../../../core/createStaticCampaignAudience/Validation";
// import { createStaticFileController } from "../../../../../core/createStaticFile";
// import { createStaticFileValidation } from "../../../../../core/createStaticFile/Validation";
// import { createSubAccountController } from "../../../../../core/createSubAccount";
// import { createSubAccountValidation } from "../../../../../core/createSubAccount/Validation";
// import { createSupervisorController } from "../../../../../core/createSupervisors";
// import { createSupervisorValidation } from "../../../../../core/createSupervisors/Validation";
import { createTagController } from "../../../../../core/createTag";
import { createTagValidation } from "../../../../../core/createTag/Validation";
import { createVariableController } from "../../../../../core/createVariable";
import { createVariableValidation } from "../../../../../core/createVariable/Validation";
import { resolve } from "path";
import multer from "multer";
import { storageMulter } from "../../../../../adapters/Multer/storage";
// import { VerifySubUserMiddleware } from "../../../../middlewares/verifySubUser";
// import { createCustomerAsaasController } from "../../../../../core/createCustomerAsaas";
// import { createCustomerAsaasValidation } from "../../../../../core/createCustomerAsaas/Validation";
// import { createCreditCardValidation } from "../../../../../core/createCreditCard/Validation";
// import { createCreditCardController } from "../../../../../core/createCreditCard";
// import { createCloneBusinessValidation } from "../../../../../core/cloneBusiness/Validation";
// import { createCloneBusinessController } from "../../../../../core/cloneBusiness";
// import { createCloneConnectionWaValidation } from "../../../../../core/cloneConnectionWa/Validation";
// import { createCloneConnectionWaController } from "../../../../../core/cloneConnectionWa";
// import { createCloneFunnelKanbanWaValidation } from "../../../../../core/cloneFunnelKanban/Validation";
// import { createCloneFunnelKanbanWaController } from "../../../../../core/cloneFunnelKanban";
// import { cloneSupervisorValidation } from "../../../../../core/cloneSupervisor/Validation";
// import { cloneSupervisorController } from "../../../../../core/cloneSupervisor";
// import { createCloneSectorAttendantValidation } from "../../../../../core/cloneSectorAttendat/Validation";
// import { createCloneSectorAttendantController } from "../../../../../core/cloneSectorAttendat";
// import { createCloneSectorValidation } from "../../../../../core/cloneSector/Validation";
// import { createCloneSectorController } from "../../../../../core/cloneSector";
// import { createCloneFlowValidation } from "../../../../../core/cloneFlow/Validation";
// import { createCloneFlowController } from "../../../../../core/cloneFlow";
// import { cloneTagValidation } from "../../../../../core/cloneTag/Validation";
// import { cloneTagController } from "../../../../../core/cloneTag";
// import { cloneVariableValidation } from "../../../../../core/cloneVariable/Validation";
// import { cloneVariableController } from "../../../../../core/cloneVariable";
// import { cloneCheckpointValidation } from "../../../../../core/cloneCheckpoint/Validation";
// import { cloneCheckpointController } from "../../../../../core/cloneCheckpoint";
// import { cloneLinkTackingPixelValidation } from "../../../../../core/cloneLinkTackingPixel/Validation";
// import { cloneLinkTackingPixelController } from "../../../../../core/cloneLinkTackingPixel";
// import { cloneAudienceValidation } from "../../../../../core/cloneAudience/Validation";
// import { cloneAudienceController } from "../../../../../core/cloneAudience";
// import { createContactCampaignAudienceValidation } from "../../../../../core/createContactCampaignAudience/Validation";
// import { createContactCampaignAudienceController } from "../../../../../core/createContactCampaignAudience";
// import { createImportCampaignAudienceController } from "../../../../../core/createImportCampaignAudience copy";
// import { createImportCampaignAudienceValidation } from "../../../../../core/createImportCampaignAudience copy/Validation";
// import { cloneCampaignParameterController } from "../../../../../core/cloneCampaignParameter";
// import { cloneCampaignParameterValidation } from "../../../../../core/cloneCampaignParameter/Validation";
// import { createCampaignOndemandController } from "../../../../../core/createCampaignOndemand";
// import { createCampaignOndemandValidation } from "../../../../../core/createCampaignOndemand/Validation";
// import { cloneCampaignOndemandValidation } from "../../../../../core/cloneCampaignOndemand/Validation";
// import { cloneCampaignOndemandController } from "../../../../../core/cloneCampaignOndemand";
// import { cloneCampaignValidation } from "../../../../../core/cloneCampaign/Validation";
// import { cloneCampaignController } from "../../../../../core/cloneCampaign";
// import { createCloneChatbotValidation } from "../../../../../core/cloneChatbot/Validation";
// import { createCloneChatbotController } from "../../../../../core/cloneChatbot";
// import { createGeolocationBusinessValidation } from "../../../../../core/createGeolocation/Validation";
// import { createGeolocationBusinessController } from "../../../../../core/createGeolocation";
// import { cloneGeolocationValidation } from "../../../../../core/cloneGeolocation/Validation";
// import { cloneGeolocationController } from "../../../../../core/cloneGeolocation";
// import { cloneEmailServiceConfigurationValidation } from "../../../../../core/cloneEmailServiceConfiguration/Validation";
// import { cloneEmailServiceConfigurationController } from "../../../../../core/cloneEmailServiceConfiguration";
// import { cloneSubAccountValidation } from "../../../../../core/cloneSubAccount/Validation";
// import { cloneSubAccountController } from "../../../../../core/cloneSubAccount";
// import { cloneIntegrationValidation } from "../../../../../core/cloneIntegration/Validation";
// import { cloneIntegrationController } from "../../../../../core/cloneIntegration";
// import { createIntegrationAiValidation } from "../../../../../core/createIntegrationAi/Validation";
// import { createIntegrationAiController } from "../../../../../core/createIntegrationAi";
// import { createCloneintegrationAiValidation } from "../../../../../core/cloneIntegrationAi/Validation";
// import { createCloneintegrationAiController } from "../../../../../core/cloneIntegrationAi";
// import { createAttendantAiValidation } from "../../../../../core/createAttendantAi/Validation";
// import { createAttendantAiController } from "../../../../../core/createAttendantAi";
// import { createCloneAttendantAiValidation } from "../../../../../core/cloneAttendantAi/Validation";
// import { createCloneAttendantAiController } from "../../../../../core/cloneAttendantAi";
// import { cloneFacebookIntegrationValidation } from "../../../../../core/cloneFacebookIntegration/Validation";
// import { cloneFacebookIntegrationController } from "../../../../../core/cloneFacebookIntegration";
// import { createFacebookIntegrationValidation } from "../../../../../core/createFacebookIntegration/Validation";
// import { createFacebookIntegrationController } from "../../../../../core/createFacebookIntegration";

const RouterV1Private_Post = Router();

// RouterV1Private_Post.post(
//   "/buy-plan",
//   createBuyPlanValidation,
//   createBuyPlanController
// );

// RouterV1Private_Post.post(
//   "/buy-extra-package",
//   createBuyExtraPackageValidation,
//   createBuyExtraPackageController
// );

const pathOfDestiny = resolve(__dirname, `../../../../../../static`);

const uploadFiles = storageMulter({ pathOfDestiny: pathOfDestiny + "/image" });

RouterV1Private_Post.post(
  "/connections-wa",
  // @ts-expect-error
  multer({ storage: uploadFiles }).single("fileImage"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  createConnectionWAValidation,
  createConnectionWAController
);

// RouterV1Private_Post.post(
//   "/campaign-parameter",
//   createParameterValidation,
//   createParameterController
// );

RouterV1Private_Post.post("/tags", createTagValidation, createTagController);

RouterV1Private_Post.post(
  "/businesses",
  createBusinessValidation,
  createBusinessController
);

// RouterV1Private_Post.post(
//   "/contactwa-account",
//   createContactWAOnAccountValidation,
//   createContactWAOnAccountController
// );

// RouterV1Private_Post.post(
//   "/campaign-audience/ondemand",
//   createOnDemandAudienceValidation,
//   createOnDemandAudienceController
// );

// RouterV1Private_Post.post(
//   "/campaign-audience/static",
//   createStaticCampaignAudienceValidation,
//   createStaticCampaignAudienceController
// );

// RouterV1Private_Post.post(
//   "/campaign-audience/import",
//   createImportCampaignAudienceValidation,
//   createImportCampaignAudienceController
// );

// RouterV1Private_Post.post(
//   "/campaign-audience/interactions",
//   createInteractionsCampaignAudienceValidation,
//   createInteractionsCampaignAudienceController
// );

// RouterV1Private_Post.post(
//   "/campaign-audience/aggregation",
//   createAggregationCampaignAudienceValidation,
//   createAggregationCampaignAudienceController
// );

RouterV1Private_Post.post("/flows", createFlowValidation, createFlowController);

// RouterV1Private_Post.post(
//   "/campaign-ondemand",
//   createCampaignOndemandValidation,
//   createCampaignOndemandController
// );

RouterV1Private_Post.post(
  "/variables",
  createVariableValidation,
  createVariableController
);

// const pathOfDestiny = resolve(__dirname, `../../../../../../static`);

// const storages: { [T in TypeStaticPath]: multer.StorageEngine } = {
//   video: storageMulter({ pathOfDestiny: pathOfDestiny + "/video" }),
//   image: storageMulter({ pathOfDestiny: pathOfDestiny + "/image" }),
//   audio: storageMulter({ pathOfDestiny: pathOfDestiny + "/audio" }),
//   file: storageMulter({ pathOfDestiny: pathOfDestiny + "/file" }),
//   pdf: storageMulter({ pathOfDestiny: pathOfDestiny + "/pdf" }),
// };

// RouterV1Private_Post.post(
//   "/static-file/:type",
//   (req, res, next) =>
//     multer({ storage: storages[req.params.type as TypeStaticPath] }).single(
//       "upload_file"
//     )(req, res, next),
//   (req, res, next) => {
//     if (req.file) {
//       req.body = {
//         accountId: Number(req.headers.authorization),
//         subUserUid: req.headers.subUserUid as string,
//         type: req.params.type as TypeStaticPath,
//         name: req.file.filename,
//         originalName: req.file.originalname,
//         size: req.file.size,
//       };
//       next();
//     }
//   },
//   createStaticFileValidation,
//   (req, res, next) =>
//     VerifySubUserMiddleware(req, res, next, {
//       type: "Create",
//       entity: "uploadFile",
//     }),
//   removeSubUserUid,
//   createStaticFileController
// );

// RouterV1Private_Post.post(
//   "/checkpoint",
//   createCheckPointValidation,
//   createCheckPointController
// );

// RouterV1Private_Post.post(
//   "/supervisor",
//   createSupervisorValidation,
//   createSupervisorController
// );

// RouterV1Private_Post.post(
//   "/sector-attendant",
//   createSectorAttendantValidation,
//   createSectorAttendantController
// );

// RouterV1Private_Post.post(
//   "/sector",
//   createSectorValidation,
//   createSectorController
// );

// RouterV1Private_Post.post(
//   "/email-service-configuration",
//   createEmailServiceConfigurationValidation,
//   createEmailServiceConfigurationController
// );

// RouterV1Private_Post.post(
//   "/link-tracking-pixel",
//   createLinkTackingPixelValidation,
//   createLinkTackingPixelController
// );

// RouterV1Private_Post.post(
//   "/authorization-account",
//   createAuthorizationAccountValidation,
//   createAuthorizationAccountController
// );

RouterV1Private_Post.post(
  "/chatbots",
  createChatbotValidation,
  createChatbotController
);

// RouterV1Private_Post.post(
//   "/integration",
//   createIntegrationValidation,
//   createIntegrationController
// );

// RouterV1Private_Post.post(
//   "/sub-user",
//   createSubAccountValidation,
//   createSubAccountController
// );

// RouterV1Private_Post.post(
//   "/clone-sub-user/:id",
//   cloneSubAccountValidation,
//   cloneSubAccountController
// );

// RouterV1Private_Post.post(
//   "/funil-kanban",
//   createKanbanValidation,
//   createKanbanController
// );

// RouterV1Private_Post.post(
//   "/costumer",
//   createCustomerAsaasValidation,
//   createCustomerAsaasController
// );

// RouterV1Private_Post.post(
//   "/credit-card",
//   createCreditCardValidation,
//   createCreditCardController
// );

// RouterV1Private_Post.post(
//   "/clone-business/:id",
//   createCloneBusinessValidation,
//   createCloneBusinessController
// );

// RouterV1Private_Post.post(
//   "/clone-connection-whatsapp/:id",
//   createCloneConnectionWaValidation,
//   createCloneConnectionWaController
// );

// RouterV1Private_Post.post(
//   "/clone-funnel-kanban/:id",
//   createCloneFunnelKanbanWaValidation,
//   createCloneFunnelKanbanWaController
// );

// RouterV1Private_Post.post(
//   "/clone-supervisor/:id",
//   cloneSupervisorValidation,
//   cloneSupervisorController
// );

// RouterV1Private_Post.post(
//   "/clone-sector-attendant/:id",
//   createCloneSectorAttendantValidation,
//   createCloneSectorAttendantController
// );

// RouterV1Private_Post.post(
//   "/clone-sector/:id",
//   createCloneSectorValidation,
//   createCloneSectorController
// );

// RouterV1Private_Post.post(
//   "/clone-flow/:id",
//   createCloneFlowValidation,
//   createCloneFlowController
// );

// RouterV1Private_Post.post(
//   "/clone-tag/:id",
//   cloneTagValidation,
//   cloneTagController
// );

// RouterV1Private_Post.post(
//   "/clone-variable/:id",
//   cloneVariableValidation,
//   cloneVariableController
// );

// RouterV1Private_Post.post(
//   "/clone-checkpoint/:id",
//   cloneCheckpointValidation,
//   cloneCheckpointController
// );

// RouterV1Private_Post.post(
//   "/clone-link-tracking-pixel/:id",
//   cloneLinkTackingPixelValidation,
//   cloneLinkTackingPixelController
// );

// RouterV1Private_Post.post(
//   "/clone-audience/:id",
//   cloneAudienceValidation,
//   cloneAudienceController
// );

// RouterV1Private_Post.post(
//   "/clone-campaign-parameter/:id",
//   cloneCampaignParameterValidation,
//   cloneCampaignParameterController
// );

// RouterV1Private_Post.post(
//   "/clone-campaign-ondemand/:id",
//   cloneCampaignOndemandValidation,
//   cloneCampaignOndemandController
// );

// RouterV1Private_Post.post(
//   "/contact-campaign-audience",
//   createContactCampaignAudienceValidation,
//   createContactCampaignAudienceController
// );

// RouterV1Private_Post.post(
//   "/clone-campaign/:id",
//   cloneCampaignValidation,
//   cloneCampaignController
// );

// RouterV1Private_Post.post(
//   "/clone-chatbot/:id",
//   createCloneChatbotValidation,
//   createCloneChatbotController
// );

// RouterV1Private_Post.post(
//   "/geolocation",
//   createGeolocationBusinessValidation,
//   createGeolocationBusinessController
// );

// RouterV1Private_Post.post(
//   "/clone-geolocation/:id",
//   cloneGeolocationValidation,
//   cloneGeolocationController
// );

// RouterV1Private_Post.post(
//   "/clone-email-service-configuration/:id",
//   cloneEmailServiceConfigurationValidation,
//   cloneEmailServiceConfigurationController
// );

// RouterV1Private_Post.post(
//   "/clone-integration/:id",
//   cloneIntegrationValidation,
//   cloneIntegrationController
// );

// RouterV1Private_Post.post(
//   "/integration-ai",
//   createIntegrationAiValidation,
//   createIntegrationAiController
// );

// RouterV1Private_Post.post(
//   "/clone-integration-ai/:id",
//   createCloneintegrationAiValidation,
//   createCloneintegrationAiController
// );

// const uploadFiles = multer({
//   storage: storageMulter({ pathOfDestiny: pathOfDestiny + "/file" }),
// });

// RouterV1Private_Post.post(
//   "/attendant-ai",
//   uploadFiles.array("files"),
//   (req, res, next) => {
//     req.body = {
//       ...req.body,
//       aiId: Number(req.body.aiId),
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
//   createAttendantAiValidation,
//   createAttendantAiController
// );

// RouterV1Private_Post.post(
//   "/clone-attendant-ai/:id",
//   createCloneAttendantAiValidation,
//   createCloneAttendantAiController
// );

// RouterV1Private_Post.post(
//   "/clone-facebook-integration/:id",
//   cloneFacebookIntegrationValidation,
//   cloneFacebookIntegrationController
// );

// RouterV1Private_Post.post(
//   "/facebook-integration",
//   createFacebookIntegrationValidation,
//   createFacebookIntegrationController
// );

export default RouterV1Private_Post;
