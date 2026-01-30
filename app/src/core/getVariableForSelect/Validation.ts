import { TypeVariable } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetVariableForSelectBodyDTO_I,
  GetVariableForSelectQueryDTO_I,
} from "./DTO";

export const getVariableForSelectValidation = (
  req: Request<
    any,
    any,
    GetVariableForSelectBodyDTO_I,
    GetVariableForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    type: Joi.array()
      .items(Joi.string().valid("dynamics", "constant", "system"))
      .optional(),
    name: Joi.string().allow(""),
    businessIds: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  req.query.businessIds = req.query.businessIds?.map((b) => Number(b));
  req.body.accountId = req.user?.id!;
  next();
};
