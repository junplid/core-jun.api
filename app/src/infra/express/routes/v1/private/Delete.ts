import { Router } from "express";
import { deleteBusinessOnAccountController } from "../../../../../core/deleteBusinessOnAccount";
import { deleteBusinessOnAccountValidation } from "../../../../../core/deleteBusinessOnAccount/Validation";
import { deleteChatbotController } from "../../../../../core/deleteChatbot";
import { deleteChatbotValidation } from "../../../../../core/deleteChatbot/Validation";
import { deleteConnectionWAController } from "../../../../../core/deleteConnectionWA";
import { deleteConnectionWAValidation } from "../../../../../core/deleteConnectionWA/Validation";
import { deleteFlowController } from "../../../../../core/deleteFlow";
import { deleteFlowValidation } from "../../../../../core/deleteFlow/Validation";
import { deleteTagController } from "../../../../../core/deleteTag";
import { deleteTagValidation } from "../../../../../core/deleteTag/Validation";
import { deleteVariableController } from "../../../../../core/deleteVariables";
import { deleteVariableValidation } from "../../../../../core/deleteVariables/Validation";

const RouterV1Private_Delete = Router();

RouterV1Private_Delete.delete(
  "/tags/:id",
  deleteTagValidation,
  deleteTagController
);

RouterV1Private_Delete.delete(
  "/business/:id",
  deleteBusinessOnAccountValidation,
  deleteBusinessOnAccountController
);

RouterV1Private_Delete.delete(
  "/variables/:id",
  deleteVariableValidation,
  deleteVariableController
);

RouterV1Private_Delete.delete(
  "/flows/:flowId",
  deleteFlowValidation,
  deleteFlowController
);

RouterV1Private_Delete.delete(
  "/connections-wa/:id",
  deleteConnectionWAValidation,
  deleteConnectionWAController
);

RouterV1Private_Delete.delete(
  "/chatbots/:id",
  deleteChatbotValidation,
  deleteChatbotController
);

export default RouterV1Private_Delete;
