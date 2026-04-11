import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GenerateMenuOnlineReportBodyDTO_I,
  GenerateMenuOnlineReportParamsDTO_I,
} from "./DTO";

export const generateMenuOnlineReportValidation = (
  req: Request<
    GenerateMenuOnlineReportParamsDTO_I,
    any,
    GenerateMenuOnlineReportBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    start: Joi.date().required(),
    end: Joi.date().allow(null).required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false },
  );

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
