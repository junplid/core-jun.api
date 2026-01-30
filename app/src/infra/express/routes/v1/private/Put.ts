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
import { updateAppointmentValidation } from "../../../../../core/updateAppointment/Validation";
import { updateAppointmentController } from "../../../../../core/updateAppointment";
import { csrfMiddleware } from "../../../../middlewares/csrf";

const RouterV1Private_Put = Router();

RouterV1Private_Put.put("/tags/:id", updateTagValidation, updateTagController);

RouterV1Private_Put.put(
  "/businesses/:id",
  csrfMiddleware,
  updateBusinessOnAccountValidation,
  updateBusinessOnAccountController,
);

RouterV1Private_Put.put(
  "/flows/:id/data",
  csrfMiddleware,
  updateDataFlowValidation,
  updateDataFlowController,
);

RouterV1Private_Put.put(
  "/disconnect-connection-whatsapp/:id",
  csrfMiddleware,
  updateDisconnectConnectionWhatsappValidation,
  updateDisconnectConnectionWhatsappController,
);

let pathOfDestiny = "";
if (process.env.NODE_ENV === "production") {
  pathOfDestiny = resolve(__dirname, `../static`);
} else {
  pathOfDestiny = resolve(__dirname, `../../../../../../static`);
}

const uploadImage = storageMulter({
  pathOfDestiny: pathOfDestiny + "/image",
});

RouterV1Private_Put.put(
  "/connections-wa/:id",
  csrfMiddleware,
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  updateConnectionWAValidation,
  updateConnectionWAController,
);

RouterV1Private_Put.put(
  "/flows/:id",
  csrfMiddleware,
  updateFlowValidation,
  updateFlowController,
);

RouterV1Private_Put.put(
  "/variables/:id",
  csrfMiddleware,
  updateVariableValidation,
  updateVariableController,
);

RouterV1Private_Put.put(
  "/chatbots/:id",
  csrfMiddleware,
  updateChatbotValidation,
  updateChatbotController,
);

RouterV1Private_Put.put(
  "/account",
  csrfMiddleware,
  updateAccountValidation,
  updateAccountController,
);

RouterV1Private_Put.put(
  "/campaigns/:id",
  csrfMiddleware,
  updateCampaignValidation,
  updateCampaignController,
);

RouterV1Private_Put.put(
  "/storage-files/:id",
  csrfMiddleware,
  updateStorageFileValidation,
  updateStorageFileController,
);

RouterV1Private_Put.put(
  "/agents-ai/:id",
  csrfMiddleware,
  updateAgentAIValidation,
  updateAgentAIController,
);

RouterV1Private_Put.put(
  "/inbox-users/:id",
  csrfMiddleware,
  updateInboxUserValidation,
  updateInboxUserController,
);

RouterV1Private_Put.put(
  "/inbox-departments/:id",
  csrfMiddleware,
  updateInboxDepartmentValidation,
  updateInboxDepartmentController,
);

RouterV1Private_Put.put(
  "/fb-pixels/:id",
  csrfMiddleware,
  updateFbPixelValidation,
  updateFbPixelController,
);

RouterV1Private_Put.put(
  "/integration/payments/:id",
  csrfMiddleware,
  updatePaymentIntegrationValidation,
  updatePaymentIntegrationController,
);

RouterV1Private_Put.put(
  "/integration/trello/:id",
  csrfMiddleware,
  updateTrelloIntegrationValidation,
  updateTrelloIntegrationController,
);

RouterV1Private_Put.put(
  "/menus-online/:id",
  csrfMiddleware,
  // @ts-expect-error
  multer({ storage: uploadImage }).single("fileImage"),
  updateMenuOnlineValidation,
  updateMenuOnlineController,
);

RouterV1Private_Put.put(
  "/appointments/:id",
  csrfMiddleware,
  updateAppointmentValidation,
  updateAppointmentController,
);

export default RouterV1Private_Put;
