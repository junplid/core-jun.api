// import { TypeStaticPath } from "@prisma/client";
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

const RouterV1Private_Post = Router();

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

export default RouterV1Private_Post;
