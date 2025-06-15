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
import { createCampaignValidation } from "../../../../../core/createCampaign/Validation";
import { createCampaignController } from "../../../../../core/createCampaign";
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

const RouterV1Private_Post = Router();

let pathOfDestiny = "";
if (process.env.NODE_ENV === "production") {
  pathOfDestiny = resolve(__dirname, `../static`);
} else {
  pathOfDestiny = resolve(__dirname, `../../../../../../static`);
}

const uploadFile = storageMulter({ pathOfDestiny: pathOfDestiny + "/image" });
const uploadFiles = storageMulter({
  pathOfDestiny: pathOfDestiny + "/storage",
});

RouterV1Private_Post.post(
  "/connections-wa",
  // @ts-expect-error
  multer({ storage: uploadFile }).single("fileImage"),
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
  "/tickets/:id/message",
  // @ts-expect-error
  multer({ storage: uploadFiles }).array("files"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  sendTicketMessageValidation,
  sendTicketMessageController
);

export default RouterV1Private_Post;
