import { NextFunction, Request, Response } from "express";
import {
  GetTagForSelectBodyDTO_I,
  GetTagForSelectParamsDTO_I,
  GetTagForSelectQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getTagForSelectValidation = (
  req: Request<
    GetTagForSelectParamsDTO_I,
    any,
    GetTagForSelectBodyDTO_I,
    GetTagForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    type: Joi.string()
      .regex(/(contactwa|audience)/)
      .required(),
    businessIds: Joi.string().required(),
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

  req.params.businessIds = (req.params.businessIds as unknown as string)
    .split("-")
    .map((b) => Number(b));

  next();
};
