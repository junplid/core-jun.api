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
import { createTemplate_root_Validation } from "../../../../../core/createTemplate_root/Validation";
import { createTemplate_root_Controller } from "../../../../../core/createTemplate_root";

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

const pathOfDestiny = resolve(process.env.STORAGE_PATH!, "static");

const uploadFiles = storageMulter({
  pathOfDestiny: pathOfDestiny + "/storage",
});
RouterV1Root_Post.post(
  "/upload-image",
  csrfMiddleware,
  multer({
    storage: uploadFiles,
    limits: { fileSize: 13 * 1024 * 1024 },
  }).single("image"),
  uploadImageRootValidation,
  uploadImageRootController,
);

RouterV1Root_Post.post(
  "/templates",
  csrfMiddleware,
  createTemplate_root_Validation,
  createTemplate_root_Controller,
);

export default RouterV1Root_Post;
