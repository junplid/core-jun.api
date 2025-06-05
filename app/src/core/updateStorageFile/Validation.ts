import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateStorageFileBodyDTO_I,
  UpdateStorageFileParamsDTO_I,
  UpdateStorageFileQueryDTO_I,
} from "./DTO";

export const updateStorageFileValidation = (
  req: Request<
    UpdateStorageFileParamsDTO_I,
    any,
    UpdateStorageFileBodyDTO_I,
    UpdateStorageFileQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.string().required(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).optional(),
    originalName: Joi.string(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
    { abortEarly: false }
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  if (req.query.businessIds?.length) {
    req.query.businessIds = req.query.businessIds.map((id) => Number(id));
  }
  req.params.id = Number(req.params.id);

  next();
};
