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

export default RouterV1Private_Put;
