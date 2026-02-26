import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UploadImageRootDTO_I } from "./DTO";
import { remove } from "fs-extra";

export const uploadImageRootValidation = async (
  req: Request<any, any, UploadImageRootDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  });

  const validation = schemaValidation.validate(
    {
      fileName: req.file?.filename,
      originalName: req.file?.originalname,
    },
    { abortEarly: false },
  );

  if (validation.error) {
    if (req.file?.path) await remove(req.file?.path);
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.body = validation.value;
  next();
};
