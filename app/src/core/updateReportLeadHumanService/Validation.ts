import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateReportLeadHumanServiceBodyDTO_I,
  UpdateReportLeadHumanServiceParamsDTO_I,
} from "./DTO";

export const updateReportLeadHumanServiceValidation = (
  req: Request<
    UpdateReportLeadHumanServiceParamsDTO_I,
    any,
    UpdateReportLeadHumanServiceBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    value: Joi.string().required(),
    type: Joi.string().valid("pendency", "note").required(),
    id: Joi.number().required(),
    userId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  if (req.params.id) req.params.id = Number(req.params.id);

  next();
};
