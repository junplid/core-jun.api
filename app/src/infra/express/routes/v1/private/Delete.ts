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
import { deleteInboxUsersValidation } from "../../../../../core/deleteInboxUser/Validation";
import { deleteInboxUsersController } from "../../../../../core/deleteInboxUser";
import { deleteInboxDepartmentValidation } from "../../../../../core/deleteInboxDepartment/Validation";
import { deleteInboxDepartmentController } from "../../../../../core/deleteInboxDepartment";
import { deleteTagOnContactWAValidation } from "../../../../../core/deleteTagOnContactWA copy/Validation";
import { deleteTagOnContactWAController } from "../../../../../core/deleteTagOnContactWA copy";
import { deleteFbPixelValidation } from "../../../../../core/deleteFbPixel/Validation";
import { deleteFbPixelController } from "../../../../../core/deleteFbPixel";
import { deletePaymentIntegrationValidation } from "../../../../../core/deletePaymentIntegration/Validation";
import { deletePaymentIntegrationController } from "../../../../../core/deletePaymentIntegration";
import { deleteTrelloIntegrationValidation } from "../../../../../core/deleteTrelloIntegration/Validation";
import { deleteTrelloIntegrationController } from "../../../../../core/deleteTrelloIntegration";
import { deleteMenuOnlineValidation } from "../../../../../core/deleteMenuOnline/Validation";
import { deleteMenuOnlineController } from "../../../../../core/deleteMenuOnline";
import { deleteMenuOnlineItemValidation } from "../../../../../core/deleteMenuOnlineItem/Validation";
import { deleteMenuOnlineItemController } from "../../../../../core/deleteMenuOnlineItem";
import { deleteAppointmentValidation } from "../../../../../core/deleteAppointment/Validation";
import { deleteAppointmentController } from "../../../../../core/deleteAppointment";
import { csrfMiddleware } from "../../../../middlewares/csrf";

const RouterV1Private_Delete = Router();

RouterV1Private_Delete.delete(
  "/tags/:id",
  csrfMiddleware,
  deleteTagValidation,
  deleteTagController,
);

RouterV1Private_Delete.delete(
  "/business/:id",
  csrfMiddleware,
  deleteBusinessOnAccountValidation,
  deleteBusinessOnAccountController,
);

RouterV1Private_Delete.delete(
  "/variables/:id",
  csrfMiddleware,
  deleteVariableValidation,
  deleteVariableController,
);

RouterV1Private_Delete.delete(
  "/flows/:flowId",
  csrfMiddleware,
  deleteFlowValidation,
  deleteFlowController,
);

RouterV1Private_Delete.delete(
  "/connections-wa/:id",
  csrfMiddleware,
  deleteConnectionWAValidation,
  deleteConnectionWAController,
);

RouterV1Private_Delete.delete(
  "/chatbots/:id",
  csrfMiddleware,
  deleteChatbotValidation,
  deleteChatbotController,
);

RouterV1Private_Delete.delete(
  "/campaigns/:id",
  csrfMiddleware,
  deleteCampaignValidation,
  deleteCampaignController,
);

RouterV1Private_Delete.delete(
  "/storage-files/:id",
  csrfMiddleware,
  deleteStorageFileValidation,
  deleteStorageFileController,
);

RouterV1Private_Delete.delete(
  "/agents-ai/:id",
  csrfMiddleware,
  deleteAgentAIValidation,
  deleteAgentAIController,
);

RouterV1Private_Delete.delete(
  "/inbox-users/:id",
  csrfMiddleware,
  deleteInboxUsersValidation,
  deleteInboxUsersController,
);

RouterV1Private_Delete.delete(
  "/inbox-departments/:id",
  csrfMiddleware,
  deleteInboxDepartmentValidation,
  deleteInboxDepartmentController,
);

RouterV1Private_Delete.delete(
  "/tags/:id/contact-wa",
  csrfMiddleware,
  deleteTagOnContactWAValidation,
  deleteTagOnContactWAController,
);

RouterV1Private_Delete.delete(
  "/fb-pixels/:id",
  csrfMiddleware,
  deleteFbPixelValidation,
  deleteFbPixelController,
);

RouterV1Private_Delete.delete(
  "/integration/payments/:id",
  csrfMiddleware,
  deletePaymentIntegrationValidation,
  deletePaymentIntegrationController,
);

RouterV1Private_Delete.delete(
  "/integration/trello/:id",
  csrfMiddleware,
  deleteTrelloIntegrationValidation,
  deleteTrelloIntegrationController,
);

RouterV1Private_Delete.delete(
  "/menus-online/:uuid",
  csrfMiddleware,
  deleteMenuOnlineValidation,
  deleteMenuOnlineController,
);

RouterV1Private_Delete.delete(
  "/menus-online/item/:uuid",
  csrfMiddleware,
  deleteMenuOnlineItemValidation,
  deleteMenuOnlineItemController,
);

RouterV1Private_Delete.delete(
  "/appointments/:id",
  csrfMiddleware,
  deleteAppointmentValidation,
  deleteAppointmentController,
);

export default RouterV1Private_Delete;
