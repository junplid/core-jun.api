import { NextFunction, Request, Response } from "express";
import {
  GetBusinessOnAccountForSelectBodyDTO_I,
  GetBusinessOnAccountForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getBusinessOnAccountForSelectValidation = (
  req: Request<
    any,
    any,
    GetBusinessOnAccountForSelectBodyDTO_I,
    GetBusinessOnAccountForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    filterIds: Joi.string(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  if (req.query.filterIds) {
    req.query.filterIds = String(req.query.filterIds)
      .split("-")
      .map((id) => Number(id));
  }
  req.body.accountId = req.user?.id!;

  next();
};
