import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateReportLeadHumanServiceDTO_I } from "./DTO";

export const createReportLeadHumanServiceValidation = (
  req: Request<any, any, CreateReportLeadHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    userId: Joi.number().required(),
    value: Joi.string().required(),
    ticketId: Joi.number().required(),
    type: Joi.string().valid("pendency", "note").required(),
  }).required();

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
