import { NextFunction, Request, Router } from "express";
import { createBusinessController } from "../../../../../core/createBusiness";
import { createBusinessValidation } from "../../../../../core/createBusiness/Validation";
import { createChatbotController } from "../../../../../core/createChatbot";
import { createChatbotValidation } from "../../../../../core/createChatbot/Validation";
import { createConnectionWAController } from "../../../../../core/createConnectionWhatsapp";
import { createConnectionWAValidation } from "../../../../../core/createConnectionWhatsapp/Validation";
import { createFlowController } from "../../../../../core/createFlow";
import { createFlowValidation } from "../../../../../core/createFlow/Validation";
import { createTagController } from "../../../../../core/createTag";
import { createTagValidation } from "../../../../../core/createTag/Validation";
import { createVariableController } from "../../../../../core/createVariable";
import { createVariableValidation } from "../../../../../core/createVariable/Validation";
import { resolve } from "path";
import multer from "multer";
import { storageMulter } from "../../../../../adapters/Multer/storage";
import { createPaymentIntegrationValidation } from "../../../../../core/createPaymentIntegration/Validation";
import { createPaymentIntegrationController } from "../../../../../core/createPaymentIntegration";
import { createStorageFileValidation } from "../../../../../core/createStorageFile/Validation";
import { createStorageFileController } from "../../../../../core/createStorageFile";
import { createAgentAIValidation } from "../../../../../core/createAgentAI/Validation";
import { createAgentAIController } from "../../../../../core/createAgentAI";
import { testAgentAIValidation } from "../../../../../core/testAgentAI/Validation";
import { testAgentAIController } from "../../../../../core/testAgentAI";
import { createInboxUsersValidation } from "../../../../../core/createInboxUser/Validation";
import { createInboxUsersController } from "../../../../../core/createInboxUser";
import { createInboxDepartmentValidation } from "../../../../../core/createInboxDepartment/Validation";
import { createInboxDepartmentController } from "../../../../../core/createInboxDepartment";
import { pickTicketValidation } from "../../../../../core/pickTicket/Validation";
import { pickTicketController } from "../../../../../core/pickTicket";
import { sendTicketMessageValidation } from "../../../../../core/sendTicketMessage/Validation";
import { sendTicketMessageController } from "../../../../../core/sendTicketMessage";
import { returnTicketValidation } from "../../../../../core/returnTicket/Validation";
import { returnTicketController } from "../../../../../core/returnTicket";
import { resolveTicketValidation } from "../../../../../core/resolveTicket/Validation";
import { resolveTicketController } from "../../../../../core/resolveTicket";
import { createTagOnContactWAValidation } from "../../../../../core/createTagOnContactWA/Validation";
import { createTagOnContactWAController } from "../../../../../core/createTagOnContactWA";
import { createFbPixelsValidation } from "../../../../../core/createFbPixels/Validation";
import { createFbPixelsController } from "../../../../../core/createFbPixels";
import { testFbPixelValidation } from "../../../../../core/testFbPixel/Validation";
import { testFbPixelController } from "../../../../../core/testFbPixel";
import { runActionChannelOrderValidation } from "../../../../../core/runActionChannelOrder/Validation";
import { runActionChannelOrderController } from "../../../../../core/runActionChannelOrder";
import { createTrelloIntegrationValidation } from "../../../../../core/createTrelloIntegration/Validation";
import { createTrelloIntegrationController } from "../../../../../core/createTrelloIntegration";
import { createMenuOnlineValidation } from "../../../../../core/createMenuOnline/Validation";
import { createMenuOnlineController } from "../../../../../core/createMenuOnline";
import { createMenuOnlineItemValidation } from "../../../../../core/createMenuOnlineItem/Validation";
import { createMenuOnlineItemController } from "../../../../../core/createMenuOnlineItem";
import { createMenuOnlineSizePizzaValidation } from "../../../../../core/createMenuOnlineSizePizza/Validation";
import { createMenuOnlineSizePizzaController } from "../../../../../core/createMenuOnlineSizePizza";
import { createCampaignValidation } from "../../../../../core/createCampaign/Validation";
import { createCampaignController } from "../../../../../core/createCampaign";
import { createPushTokenValidation } from "../../../../../core/createPushToken/Validation";
import { createPushTokenController } from "../../../../../core/createPushToken";
import { csrfMiddleware } from "../../../../middlewares/csrf";
import { createConnectionIgValidation } from "../../../../../core/createConnectionIg/Validation";
import { createConnectionIgController } from "../../../../../core/createConnectionIg";
import { createDeltaValidation } from "../../../../../core/createDelta/Validation";
import { createDeltaController } from "../../../../../core/createDelta";
import { closeAccountValidation } from "../../../../../core/closeAccount/Validation";
import { closeAccountController } from "../../../../../core/closeAccount";

const RouterV1Private_Post = Router();

let pathOfDestiny = "";
if (process.env.NODE_ENV === "production") {
  pathOfDestiny = resolve(__dirname, `../static`);
} else {
  pathOfDestiny = resolve(__dirname, `../../../../../../static`);
}

const uploadFiles = storageMulter({
  pathOfDestiny: pathOfDestiny + "/storage",
});

const uploadImage = storageMulter({
  pathOfDestiny: pathOfDestiny + "/image",
});

RouterV1Private_Post.post(
  "/connections-wa",
  csrfMiddleware,
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  createConnectionWAValidation,
  createConnectionWAController,
);

RouterV1Private_Post.post(
  "/tags",
  csrfMiddleware,
  createTagValidation,
  createTagController,
);

RouterV1Private_Post.post(
  "/businesses",
  csrfMiddleware,
  createBusinessValidation,
  createBusinessController,
);

RouterV1Private_Post.post(
  "/flows",
  csrfMiddleware,
  createFlowValidation,
  createFlowController,
);

RouterV1Private_Post.post(
  "/variables",
  csrfMiddleware,
  createVariableValidation,
  createVariableController,
);

RouterV1Private_Post.post(
  "/chatbots",
  csrfMiddleware,
  createChatbotValidation,
  createChatbotController,
);

RouterV1Private_Post.post(
  "/campaigns",
  csrfMiddleware,
  createCampaignValidation,
  createCampaignController,
);

RouterV1Private_Post.post(
  "/storage-files",
  csrfMiddleware,
  // @ts-expect-error
  multer({
    storage: uploadFiles,
    limits: {
      fileSize: 13 * 1024 * 1024, // 13 MB
    },
  }).single("file"),
  createStorageFileValidation,
  createStorageFileController,
);

RouterV1Private_Post.post(
  "/agents-ai/test",
  csrfMiddleware,
  testAgentAIValidation,
  testAgentAIController,
);

RouterV1Private_Post.post(
  "/agents-ai",
  csrfMiddleware,
  createAgentAIValidation,
  createAgentAIController,
);

RouterV1Private_Post.post(
  "/inbox-users",
  csrfMiddleware,
  createInboxUsersValidation,
  createInboxUsersController,
);

RouterV1Private_Post.post(
  "/inbox-departments",
  csrfMiddleware,
  createInboxDepartmentValidation,
  createInboxDepartmentController,
);

RouterV1Private_Post.post(
  "/tickets/:id/pick",
  csrfMiddleware,
  pickTicketValidation,
  pickTicketController,
);

RouterV1Private_Post.post(
  "/tickets/:id/return",
  csrfMiddleware,
  returnTicketValidation,
  returnTicketController,
);

RouterV1Private_Post.post(
  "/tickets/:id/resolve",
  csrfMiddleware,
  resolveTicketValidation,
  resolveTicketController,
);

RouterV1Private_Post.post(
  "/tickets/:id/message",
  csrfMiddleware,
  sendTicketMessageValidation,
  sendTicketMessageController,
);

RouterV1Private_Post.post(
  "/tags/:id/contact-wa",
  csrfMiddleware,
  createTagOnContactWAValidation,
  createTagOnContactWAController,
);

RouterV1Private_Post.post(
  "/fb-pixels",
  csrfMiddleware,
  createFbPixelsValidation,
  createFbPixelsController,
);

RouterV1Private_Post.post(
  "/fb-pixels/test",
  csrfMiddleware,
  testFbPixelValidation,
  testFbPixelController,
);

// const uploadCert = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter(_, file, cb) {
//     if (!file.originalname.endsWith(".pfx")) {
//       return cb(new Error("Invalid certificate format"));
//     }
//     cb(null, true);
//   },
// });

RouterV1Private_Post.post(
  "/integration/payments",
  csrfMiddleware,
  // uploadCert.single("certificate"),
  createPaymentIntegrationValidation,
  createPaymentIntegrationController,
);

RouterV1Private_Post.post(
  "/orders/action/:id/:action",
  csrfMiddleware,
  runActionChannelOrderValidation,
  runActionChannelOrderController,
);

RouterV1Private_Post.post(
  "/integration/trello",
  csrfMiddleware,
  createTrelloIntegrationValidation,
  createTrelloIntegrationController,
);

RouterV1Private_Post.post(
  "/menus-online",
  csrfMiddleware,
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  createMenuOnlineValidation,
  createMenuOnlineController,
);

RouterV1Private_Post.post(
  "/menus-online/:uuid/items",
  csrfMiddleware,
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  createMenuOnlineItemValidation,
  createMenuOnlineItemController,
);

RouterV1Private_Post.post(
  "/menus-online/:uuid/sizes-pizza",
  csrfMiddleware,
  createMenuOnlineSizePizzaValidation,
  createMenuOnlineSizePizzaController,
);

RouterV1Private_Post.post(
  "/push-token",
  csrfMiddleware,
  createPushTokenValidation,
  createPushTokenController,
);

RouterV1Private_Post.post("/logout", (_, res) => {
  const prod = process.env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    domain: prod ? "api.junplid.com.br" : undefined,
    path: "/",
  });

  res.clearCookie("XSRF-TOKEN", {
    domain: prod ? "api.junplid.com.br" : undefined,
    path: "/",
  });

  return res.sendStatus(204);
});

RouterV1Private_Post.post(
  "/connections-ig",
  csrfMiddleware,
  createConnectionIgValidation,
  createConnectionIgController,
);

RouterV1Private_Post.post(
  "/delta",
  csrfMiddleware,
  createDeltaValidation,
  createDeltaController,
);

RouterV1Private_Post.post(
  "/close-account",
  csrfMiddleware,
  closeAccountValidation,
  closeAccountController,
);

export default RouterV1Private_Post;
