import { Router } from "express";
import { deleteReportLeadHumanServiceController } from "../../../../../core/deleteReposrtLeadHumanService";
import { deleteReportLeadHumanServiceValidation } from "../../../../../core/deleteReposrtLeadHumanService/Validation";
import { deleteVariableContactHumanServiceValidation } from "../../../../../core/deleteVariableContact-HumanService/Validation";
import { deleteVariableContactHumanServiceController } from "../../../../../core/deleteVariableContact-HumanService";
import { deleteTagContactHumanServiceValidation } from "../../../../../core/deleteTagContact-HumanService/Validation";
import { deleteTagContactHumanServiceController } from "../../../../../core/deleteTagContact-HumanService";
import { deleteDocumentContactAccountFileController } from "../../../../../core/deleteDocumentContactAccount-HumanService";
import { deleteDocumentContactAccountFileValidation } from "../../../../../core/deleteDocumentContactAccount-HumanService/Validation";
import { deleteFastMessageController } from "../../../../../core/deleteFastMessage";
import { deleteFastMessageValidation } from "../../../../../core/deleteFastMessage/Validation";

const RouterV1HumanService_Delete = Router();

RouterV1HumanService_Delete.delete(
  "/report-lead/:ticketId/:id",
  deleteReportLeadHumanServiceValidation,
  deleteReportLeadHumanServiceController
);

RouterV1HumanService_Delete.delete(
  "/variable-contact/:id/:ticketId",
  deleteVariableContactHumanServiceValidation,
  deleteVariableContactHumanServiceController
);

RouterV1HumanService_Delete.delete(
  "/tag-contact-account/:id/:ticketId",
  deleteTagContactHumanServiceValidation,
  deleteTagContactHumanServiceController
);

RouterV1HumanService_Delete.delete(
  "/document-contact-account/:id",
  deleteDocumentContactAccountFileValidation,
  deleteDocumentContactAccountFileController
);

RouterV1HumanService_Delete.delete(
  "/fast-message/:id",
  deleteFastMessageValidation,
  deleteFastMessageController
);

export default RouterV1HumanService_Delete;
