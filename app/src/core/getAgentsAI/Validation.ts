import { NextFunction, Request, Response } from "express";
import { GetAgentsAIBodyDTO_I, GetAgentsAIQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getAgentsAIValidation = (
  req: Request<any, any, GetAgentsAIBodyDTO_I, GetAgentsAIQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    type: Joi.string()
      .regex(/^(link|message|qrcode)+(-(link|message|qrcode)+)*$/)
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  next();
};
