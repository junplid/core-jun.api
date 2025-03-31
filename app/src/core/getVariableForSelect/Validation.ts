import { TypeVariable } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetVariableForSelectBodyDTO_I,
  GetVariableForSelectParamsDTO_I,
  GetVariableForSelectQueryDTO_I,
} from "./DTO";

export const getVariableForSelectValidation = (
  req: Request<
    GetVariableForSelectParamsDTO_I,
    any,
    GetVariableForSelectBodyDTO_I,
    GetVariableForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    type: Joi.string()
      .regex(/system|dynamics|constant/)
      .optional(),
    name: Joi.string().allow(""),
    businessIds: Joi.string().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  if (req.query.type) {
    const listType = String(req.query.type).split("-");
    req.query.type = [...listType] as TypeVariable[];
  }

  next();
};
