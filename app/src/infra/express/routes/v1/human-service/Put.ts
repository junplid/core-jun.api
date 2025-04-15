import { Router } from "express";
// import multer from "multer";
// import { resolve } from "path";
// import { storageMulter } from "../../../../../adapters/Multer/storage";
// import { updateFunnelKanbanTicketController } from "../../../../../core/updateFunnelKanbanTicket";
// import { updateFunnelKanbanTicketValidation } from "../../../../../core/updateFunnelKanbanTicket/Validation";
// import { updateFunnelKanbanTicketForSelectController } from "../../../../../core/updateFunnelKanbanTicketForSelect";
// import { updateFunnelKanbanTicketForSelectValidation } from "../../../../../core/updateFunnelKanbanTicketForSelect/Validation";
// import { updateHumanServiceUserController } from "../../../../../core/updateHumanServiceUser";
// import { updateHumanServiceUserValidation } from "../../../../../core/updateHumanServiceUser/Validation";
// // import { createImageHumanServiceUserController } from "../../../../../core/updateImageHumanServiceUser";
// // import { createImageHumanServiceUserValidation } from "../../../../../core/updateImageHumanServiceUser/Validation";
// import { updatePosFunnelKanbanController } from "../../../../../core/updatePosFunnelKanban";
// import { updatePosFunnelKanbanValidation } from "../../../../../core/updatePosFunnelKanban/Validation";
// import { updateReportLeadHumanServiceController } from "../../../../../core/updateReportLeadHumanService";
// import { updateReportLeadHumanServiceValidation } from "../../../../../core/updateReportLeadHumanService/Validation";
// import { updateSectorAttendantOnHumanServiceController } from "../../../../../core/updateSectorAttendantOnHumanService";
// import { updateSectorAttendantOnHumanServiceValidation } from "../../../../../core/updateSectorAttendantOnHumanService/Validation";
// import { updateVariableContactHumanServiceValidation } from "../../../../../core/updateVariableContact-HumanService/Validation";
// import { updateVariableContactHumanServiceController } from "../../../../../core/updateVariableContact-HumanService";
// import { updateFastMessageHumanServiceValidation } from "../../../../../core/updateFastMessageHumanService/Validation";
// import { updateFastMessageHumanServiceController } from "../../../../../core/updateFastMessageHumanService";
// import { updateContactAccountHumanServiceValidation } from "../../../../../core/updateContactAccount-HumanService/Validation";
// import { updateContactAccountHumanServiceController } from "../../../../../core/updateContactAccount-HumanService";

const RouterV1HumanService_Put = Router();

// RouterV1HumanService_Put.put(
//   "/sector-attendant-on-human-service",
//   updateSectorAttendantOnHumanServiceValidation,
//   updateSectorAttendantOnHumanServiceController
// );

// RouterV1HumanService_Put.put(
//   "/report-lead/:id/:type",
//   updateReportLeadHumanServiceValidation,
//   updateReportLeadHumanServiceController
// );

// RouterV1HumanService_Put.put(
//   "/funnel-kanban/:funnelKanbanId/pos",
//   updatePosFunnelKanbanValidation,
//   updatePosFunnelKanbanController
// );

// RouterV1HumanService_Put.put(
//   "/user",
//   updateHumanServiceUserValidation,
//   updateHumanServiceUserController
// );

// RouterV1HumanService_Put.put(
//   "/funnel-kanban-ticket/:kanbanId",
//   updateFunnelKanbanTicketValidation,
//   updateFunnelKanbanTicketController
// );

// RouterV1HumanService_Put.put(
//   "/funnel-kanban-ticket-for-select/:ticketId/:columnId",
//   updateFunnelKanbanTicketForSelectValidation,
//   updateFunnelKanbanTicketForSelectController
// );

// const pathOfDestiny = resolve(__dirname, `../../../../../../static/image`);

// const upload = multer({
//   storage: storageMulter({ pathOfDestiny }),
// }).single("upload_file");

// RouterV1HumanService_Put.put(
//   "/image-human-service-user",
//   // @ts-expect-error
//   upload,
//   (req, res, next) => {
//     if (req.file) {
//       req.body = {
//         userId: Number(req.headers.authorization),
//         name: req.file.filename,
//       };
//       next();
//     } else {
//       return res.status(400).json({
//         message: "Error pra salvar a imagem",
//         status: 400,
//       });
//     }
//   },
//   createImageHumanServiceUserValidation,
//   createImageHumanServiceUserController
// );

// RouterV1HumanService_Put.put(
//   "/variable-contact",
//   updateVariableContactHumanServiceValidation,
//   updateVariableContactHumanServiceController
// );

// RouterV1HumanService_Put.put(
//   "/fast-message/:id",
//   updateFastMessageHumanServiceValidation,
//   updateFastMessageHumanServiceController
// );

// RouterV1HumanService_Put.put(
//   "/contact-account/:ticketId",
//   updateContactAccountHumanServiceValidation,
//   updateContactAccountHumanServiceController
// );

export default RouterV1HumanService_Put;
