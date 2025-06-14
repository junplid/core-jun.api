import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateInboxDepartmentBodyDTO_I,
  UpdateInboxDepartmentParamsDTO_I,
  UpdateInboxDepartmentQueryDTO_I,
} from "./DTO";

export const updateInboxDepartmentValidation = (
  req: Request<
    UpdateInboxDepartmentParamsDTO_I,
    any,
    UpdateInboxDepartmentBodyDTO_I,
    UpdateInboxDepartmentQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    businessId: Joi.number().optional(),
    signBusiness: Joi.boolean().optional(),
    signDepartment: Joi.boolean().optional(),
    signUser: Joi.boolean().optional(),
    previewNumber: Joi.boolean().optional(),
    previewPhoto: Joi.boolean().optional(),
    inboxUserIds: Joi.array().items(Joi.number().required()).optional(),
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

  req.params.id = Number(req.params.id);
  const { id, accountId, ...rest } = validation.value;
  req.query = rest;

  next();
};
