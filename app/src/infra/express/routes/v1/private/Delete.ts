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
import { deleteCampaignValidation } from "../../../../../core/deleteCampaign/Validation";
import { deleteCampaignController } from "../../../../../core/deleteCampaign";
import { deleteStorageFileValidation } from "../../../../../core/deleteStorageFile/Validation";
import { deleteStorageFileController } from "../../../../../core/deleteStorageFile";
import { deleteAgentAIValidation } from "../../../../../core/deleteAgentAI/Validation";
import { deleteAgentAIController } from "../../../../../core/deleteAgentAI";

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

RouterV1Private_Delete.delete(
  "/campaigns/:id",
  deleteCampaignValidation,
  deleteCampaignController
);

RouterV1Private_Delete.delete(
  "/storage-files/:id",
  deleteStorageFileValidation,
  deleteStorageFileController
);

RouterV1Private_Delete.delete(
  "/agents-ai/:id",
  deleteAgentAIValidation,
  deleteAgentAIController
);

export default RouterV1Private_Delete;
