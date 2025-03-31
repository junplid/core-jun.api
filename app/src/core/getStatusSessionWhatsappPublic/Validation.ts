import { NextFunction, Request, Response } from "express";
import { GetStatusSessionWhatsappPublicDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getStatusSessionWhatsappPublicValidation = (
  req: Request<GetStatusSessionWhatsappPublicDTO_I, any, { accountId: number }>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidationParams = Joi.object({
    connectionId: Joi.string().required(),
  });
  const schemaValidationBody = Joi.object({
    accountId: Joi.number().required(),
  });

  const validationParams = schemaValidationParams.validate(req, {
    abortEarly: false,
  });

  if (validationParams.error) {
    const errors = validationParams.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  const validationBody = schemaValidationBody.validate(req, {
    abortEarly: false,
  });

  if (validationBody.error) {
    const errors = validationBody.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  next();
};
