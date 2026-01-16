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
import { createMenuOnlineOrderValidation } from "../../../../../core/createMenuOnlineOrder/Validation";
import { createPushTokenValidation } from "../../../../../core/createPushToken/Validation";
import { createPushTokenController } from "../../../../../core/createPushToken";

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
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  createConnectionWAValidation,
  createConnectionWAController
);

RouterV1Private_Post.post("/tags", createTagValidation, createTagController);

RouterV1Private_Post.post(
  "/businesses",
  createBusinessValidation,
  createBusinessController
);

RouterV1Private_Post.post("/flows", createFlowValidation, createFlowController);

RouterV1Private_Post.post(
  "/variables",
  createVariableValidation,
  createVariableController
);

RouterV1Private_Post.post(
  "/chatbots",
  createChatbotValidation,
  createChatbotController
);

RouterV1Private_Post.post(
  "/campaigns",
  createCampaignValidation,
  createCampaignController
);

RouterV1Private_Post.post(
  "/storage-files",
  // @ts-expect-error
  multer({ storage: uploadFiles }).single("file"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  createStorageFileValidation,
  createStorageFileController
);

RouterV1Private_Post.post(
  "/agents-ai/test",
  testAgentAIValidation,
  testAgentAIController
);

RouterV1Private_Post.post(
  "/agents-ai",
  createAgentAIValidation,
  createAgentAIController
);

RouterV1Private_Post.post(
  "/inbox-users",
  createInboxUsersValidation,
  createInboxUsersController
);

RouterV1Private_Post.post(
  "/inbox-departments",
  createInboxDepartmentValidation,
  createInboxDepartmentController
);

RouterV1Private_Post.post(
  "/tickets/:id/pick",
  pickTicketValidation,
  pickTicketController
);

RouterV1Private_Post.post(
  "/tickets/:id/return",
  returnTicketValidation,
  returnTicketController
);

RouterV1Private_Post.post(
  "/tickets/:id/resolve",
  resolveTicketValidation,
  resolveTicketController
);

RouterV1Private_Post.post(
  "/tickets/:id/message",
  sendTicketMessageValidation,
  sendTicketMessageController
);

RouterV1Private_Post.post(
  "/tags/:id/contact-wa",
  createTagOnContactWAValidation,
  createTagOnContactWAController
);

RouterV1Private_Post.post(
  "/fb-pixels",
  createFbPixelsValidation,
  createFbPixelsController
);

RouterV1Private_Post.post(
  "/fb-pixels/test",
  testFbPixelValidation,
  testFbPixelController
);

RouterV1Private_Post.post(
  "/integration/payments",
  createPaymentIntegrationValidation,
  createPaymentIntegrationController
);

RouterV1Private_Post.post(
  "/orders/action/:id/:action",
  runActionChannelOrderValidation,
  runActionChannelOrderController
);

RouterV1Private_Post.post(
  "/integration/trello",
  createTrelloIntegrationValidation,
  createTrelloIntegrationController
);

RouterV1Private_Post.post(
  "/menus-online",
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  createMenuOnlineValidation,
  createMenuOnlineController
);

RouterV1Private_Post.post(
  "/menus-online/:uuid/items",
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  createMenuOnlineItemValidation,
  createMenuOnlineItemController
);

RouterV1Private_Post.post(
  "/menus-online/:uuid/sizes-pizza",
  createMenuOnlineSizePizzaValidation,
  createMenuOnlineSizePizzaController
);

RouterV1Private_Post.post(
  "/push-token",
  createPushTokenValidation,
  createPushTokenController
);

export default RouterV1Private_Post;
