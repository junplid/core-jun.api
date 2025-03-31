import { TypeHumanServiceReportLead } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetReportLeadHumanServiceBodyDTO_I,
  GetReportLeadHumanServiceParamsDTO_I,
  GetReportLeadHumanServiceQueryDTO_I,
} from "./DTO";

export const getReportLeadHumanServiceValidation = (
  req: Request<
    GetReportLeadHumanServiceParamsDTO_I,
    any,
    GetReportLeadHumanServiceBodyDTO_I,
    GetReportLeadHumanServiceQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    ticketId: Joi.string().required(),
    userId: Joi.number().required(),
    type: Joi.string().regex(/^(pendency|note)(?:-(pendency|note)+)*$/),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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

  if (req.query.type) {
    req.query.type = String(req.query.type).split(
      "-"
    ) as TypeHumanServiceReportLead[];
  }

  req.params.ticketId = Number(req.params.ticketId);

  next();
};
