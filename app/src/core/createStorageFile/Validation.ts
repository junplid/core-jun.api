import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateStorageFileDTO_I } from "./DTO";
import { remove } from "fs-extra";

export const createStorageFileValidation = async (
  req: Request<any, any, CreateStorageFileDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    mimetype: Joi.string().required(),
    accountId: Joi.number().required(),
    fileName: Joi.string().required(),
    size: Joi.number().required(),
    originalName: Joi.string().required(),
    businessIds: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(
    {
      ...req.body,
      businessIds: req.body.businessIds
        ? JSON.parse(String(req.body.businessIds))
        : [],
      mimetype: req.file?.mimetype,
      fileName: req.file?.filename,
      size: req.file?.size,
      originalName: req.file?.originalname,
    },
    { abortEarly: false }
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
