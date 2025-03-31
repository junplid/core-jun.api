import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetIntegrationsAiDTO_I } from "./DTO";

export const getIntegrationsAiValidation = (
  req: Request<any, any, GetIntegrationsAiDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
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

  next();
};
