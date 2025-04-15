import { Router } from "express";
// import { createNewTicketController } from "../../../../../core/createNewTicket";
// import { createNewTicketValidation } from "../../../../../core/createNewTicket/Validation";
// import { createReportLeadHumanServiceController } from "../../../../../core/createReportLeadHumanService";
// import { createReportLeadHumanServiceValidation } from "../../../../../core/createReportLeadHumanService/Validation";
// import { createTransferTicketValidation } from "../../../../../core/createTransferTicket/Validation";
// import { createTransferTicketController } from "../../../../../core/createTransferTicket";
// import { createVariableHumanServiceValidation } from "../../../../../core/createVariable-HumanService/Validation";
// import { createVariableHumanServiceController } from "../../../../../core/createVariable-HumanService";
// import { createTagContactHumanServiceController } from "../../../../../core/createTagContact-HumanService";
// import { createTagContactHumanServiceValidation } from "../../../../../core/createTagContact-HumanService/Validation";
// import { createTagHumanServiceValidation } from "../../../../../core/createTag-HumanService/Validation";
// import { createTagHumanServiceController } from "../../../../../core/createTag-HumanService";
// import { createFastMessageHumanServiceValidation } from "../../../../../core/createFastMessageHumanService/Validation";
// import { createFastMessageHumanServiceController } from "../../../../../core/createFastMessageHumanService";

// import { createDocumentContactAccountFileController } from "../../../../../core/createDocumentContactAccount-HumanService";
// import { createDocumentContactAccountFileValidation } from "../../../../../core/createDocumentContactAccount-HumanService/Validation";
// import { resolve } from "path";
// import { TypeStaticPath } from "@prisma/client";
// import multer from "multer";
// import { storageMulter } from "../../../../../adapters/Multer/storage";

const RouterV1HumanService_Post = Router();

// RouterV1HumanService_Post.post(
//   "/report-lead",
//   createReportLeadHumanServiceValidation,
//   createReportLeadHumanServiceController
// );

// RouterV1HumanService_Post.post(
//   "/new-ticket",
//   createNewTicketValidation,
//   createNewTicketController
// );

// RouterV1HumanService_Post.post(
//   "/transfer-ticket",
//   createTransferTicketValidation,
//   createTransferTicketController
// );

// RouterV1HumanService_Post.post(
//   "/variable",
//   createVariableHumanServiceValidation,
//   createVariableHumanServiceController
// );

// RouterV1HumanService_Post.post(
//   "/tag",
//   createTagHumanServiceValidation,
//   createTagHumanServiceController
// );

// RouterV1HumanService_Post.post(
//   "/tags-contact-account",
//   createTagContactHumanServiceValidation,
//   createTagContactHumanServiceController
// );

// // const pathOfDestiny = resolve(__dirname, `../../../../../../static`);

// // RouterV1HumanService_Post.post(
// //   "/document-contact-account",
// //   (req, res, next) =>
// //     multer({
// //       storage: storageMulter({
// //         pathOfDestiny: pathOfDestiny + "/documents-contact-account",
// //       }),
// //     }).single("upload_file")(req, res, next),
// //   (req, res, next) => {
// //     if (req.file) {
// //       req.body = {
// //         ...req.body,
// //         ticketId: Number(req.body.ticketId),
// //         userId: Number(req.headers.authorization),
// //         name: req.file?.filename,
// //       };
// //       next();
// //     }
// //   },
// //   createDocumentContactAccountFileValidation,
// //   createDocumentContactAccountFileController
// // );

// RouterV1HumanService_Post.post(
//   "/fast-message",
//   createFastMessageHumanServiceValidation,
//   createFastMessageHumanServiceController
// );

export default RouterV1HumanService_Post;
