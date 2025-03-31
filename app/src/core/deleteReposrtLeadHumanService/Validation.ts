import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteReportLeadHumanServiceBodyDTO_I,
  DeleteReportLeadHumanServiceParamsDTO_I,
} from "./DTO";

export const deleteReportLeadHumanServiceValidation = (
  req: Request<
    DeleteReportLeadHumanServiceParamsDTO_I,
    any,
    DeleteReportLeadHumanServiceBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    ticketId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.params, ...req.body },
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
  req.params.ticketId = Number(req.params.ticketId);

  next();
};
