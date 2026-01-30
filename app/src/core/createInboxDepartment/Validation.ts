import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateInboxDepartmentDTO_I } from "./DTO";

export const createInboxDepartmentValidation = (
  req: Request<any, any, CreateInboxDepartmentDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    signBusiness: Joi.boolean().required(),
    signDepartment: Joi.boolean().required(),
    signUser: Joi.boolean().required(),
    previewNumber: Joi.boolean().required(),
    previewPhoto: Joi.boolean().required(),
    businessId: Joi.number().required(),
    inboxUserIds: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }
  req.body.accountId = req.user?.id!;
  next();
};
