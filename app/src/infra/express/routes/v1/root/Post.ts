import { Router } from "express";
import { createShootingSpeedValidation } from "../../../../../core/createShootingSpeed/Validation";
import { createShootingSpeedController } from "../../../../../core/createShootingSpeed";
import { appendFlowAccountValidation } from "../../../../../core/appendFlowAccount/Validation";
import { appendFlowAccountController } from "../../../../../core/appendFlowAccount";
import { csrfMiddleware } from "../../../../middlewares/csrf";
import { storageMulter } from "../../../../../adapters/Multer/storage";
import { resolve } from "path";
import { uploadImageRootController } from "../../../../../core/uploadImageRoot";
import { uploadImageRootValidation } from "../../../../../core/uploadImageRoot/Validation";
import multer from "multer";
import { createAgentTemplate_root_Validation } from "../../../../../core/createAgentTemplate_root/Validation";
import { createAgentTemplate_root_Controller } from "../../../../../core/createAgentTemplate_root";

const RouterV1Root_Post = Router();

RouterV1Root_Post.post(
  "/shooting-speed",
  csrfMiddleware,
  createShootingSpeedValidation,
  createShootingSpeedController,
);

RouterV1Root_Post.post(
  "/append-flow",
  csrfMiddleware,
  appendFlowAccountValidation,
  appendFlowAccountController,
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
RouterV1Root_Post.post(
  "/upload-image",
  csrfMiddleware,
  // @ts-expect-error
  multer({
    storage: uploadFiles,
    limits: { fileSize: 13 * 1024 * 1024 },
  }).single("image"),
  uploadImageRootValidation,
  uploadImageRootController,
);

RouterV1Root_Post.post(
  "/template-agents",
  csrfMiddleware,
  createAgentTemplate_root_Validation,
  createAgentTemplate_root_Controller,
);

export default RouterV1Root_Post;
