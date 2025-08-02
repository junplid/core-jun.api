import multer from "multer";
import { NextFunction, Request, Router } from "express";
import { updateBusinessOnAccountController } from "../../../../../core/updateBusinessOnAccount";
import { updateBusinessOnAccountValidation } from "../../../../../core/updateBusinessOnAccount/Validation";
import { updateTagController } from "../../../../../core/updateTag";
import { updateTagValidation } from "../../../../../core/updateTag/Validation";
import { updateDataFlowController } from "../../../../../core/updateDataFlow";
import { updateDataFlowValidation } from "../../../../../core/updateDataFlow/Validation";
import { updateDisconnectConnectionWhatsappController } from "../../../../../core/updateDisconnectConnectionWhatsapp";
import { updateDisconnectConnectionWhatsappValidation } from "../../../../../core/updateDisconnectConnectionWhatsapp/Validation";
import { updateFlowValidation } from "../../../../../core/updateFlow/Validation";
import { updateFlowController } from "../../../../../core/updateFlow";
import { updateVariableValidation } from "../../../../../core/updateVariable/Validation";
import { updateVariableController } from "../../../../../core/updateVariable";
import { updateChatbotValidation } from "../../../../../core/updateChatbot/Validation";
import { updateChatbotController } from "../../../../../core/updateChatbot";
import { updateConnectionWAController } from "../../../../../core/updateConnectionWA";
import { updateConnectionWAValidation } from "../../../../../core/updateConnectionWA/Validation";
import { resolve } from "path";
import { storageMulter } from "../../../../../adapters/Multer/storage";
import { updateAccountValidation } from "../../../../../core/updateAccount/Validation";
import { updateAccountController } from "../../../../../core/updateAccount";
import { updateCampaignValidation } from "../../../../../core/updateCampaign/Validation";
import { updateCampaignController } from "../../../../../core/updateCampaign";
import { updateStorageFileValidation } from "../../../../../core/updateStorageFile/Validation";
import { updateStorageFileController } from "../../../../../core/updateStorageFile";
import { updateAgentAIValidation } from "../../../../../core/updateAgentAI/Validation";
import { updateAgentAIController } from "../../../../../core/updateAgentAI";
import { updateInboxUserValidation } from "../../../../../core/updateInboxUser/Validation";
import { updateInboxUserController } from "../../../../../core/updateInboxUser";
import { updateInboxDepartmentValidation } from "../../../../../core/updateInboxDepartment/Validation";
import { updateInboxDepartmentController } from "../../../../../core/updateInboxDepartment";
import { updateFbPixelValidation } from "../../../../../core/updateFbPixel/Validation";
import { updateFbPixelController } from "../../../../../core/updateFbPixel";
import { updatePaymentIntegrationValidation } from "../../../../../core/updatePaymentIntegration/Validation";
import { updatePaymentIntegrationController } from "../../../../../core/updatePaymentIntegration";
import { updateTrelloIntegrationValidation } from "../../../../../core/updateTrelloIntegration/Validation";
import { updateTrelloIntegrationController } from "../../../../../core/updateTrelloIntegration";
import { updateMenuOnlineValidation } from "../../../../../core/updateMenuOnline/Validation";
import { updateMenuOnlineController } from "../../../../../core/updateMenuOnline";

const RouterV1Private_Put = Router();

RouterV1Private_Put.put("/tags/:id", updateTagValidation, updateTagController);

RouterV1Private_Put.put(
  "/businesses/:id",
  updateBusinessOnAccountValidation,
  updateBusinessOnAccountController
);

RouterV1Private_Put.put(
  "/flows/:id/data",
  updateDataFlowValidation,
  updateDataFlowController
);

RouterV1Private_Put.put(
  "/disconnect-connection-whatsapp/:id",
  updateDisconnectConnectionWhatsappValidation,
  updateDisconnectConnectionWhatsappController
);

let pathOfDestiny = "";
if (process.env.NODE_ENV === "production") {
  pathOfDestiny = resolve(__dirname, `../static`);
} else {
  pathOfDestiny = resolve(__dirname, `../../../../../../static`);
}

const uploadFiles = storageMulter({
  pathOfDestiny: pathOfDestiny + "/storage",
});

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

RouterV1Private_Put.put(
  "/chatbots/:id",
  updateChatbotValidation,
  updateChatbotController
);

RouterV1Private_Put.put(
  "/account",
  updateAccountValidation,
  updateAccountController
);

RouterV1Private_Put.put(
  "/campaigns/:id",
  updateCampaignValidation,
  updateCampaignController
);

RouterV1Private_Put.put(
  "/storage-files/:id",
  updateStorageFileValidation,
  updateStorageFileController
);

RouterV1Private_Put.put(
  "/agents-ai/:id",
  updateAgentAIValidation,
  updateAgentAIController
);

RouterV1Private_Put.put(
  "/inbox-users/:id",
  updateInboxUserValidation,
  updateInboxUserController
);

RouterV1Private_Put.put(
  "/inbox-departments/:id",
  updateInboxDepartmentValidation,
  updateInboxDepartmentController
);

RouterV1Private_Put.put(
  "/fb-pixels/:id",
  updateFbPixelValidation,
  updateFbPixelController
);

RouterV1Private_Put.put(
  "/integration/payments/:id",
  updatePaymentIntegrationValidation,
  updatePaymentIntegrationController
);

RouterV1Private_Put.put(
  "/integration/trello/:id",
  updateTrelloIntegrationValidation,
  updateTrelloIntegrationController
);

RouterV1Private_Put.put(
  "/menus-online/:id",
  // @ts-expect-error
  multer({ storage: uploadFiles }).single("fileImage"),
  (req: Request, _, next: NextFunction) => {
    req.body.accountId = Number(req.headers.authorization);
    next();
  },
  updateMenuOnlineValidation,
  updateMenuOnlineController
);

export default RouterV1Private_Put;
