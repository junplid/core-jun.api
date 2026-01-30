import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetVariableBusinessBodyDTO_I,
  GetVariableBusinessQueryDTO_I,
} from "./DTO";

export const getVariableBusinessValidation = (
  req: Request<
    any,
    any,
    GetVariableBusinessBodyDTO_I,
    GetVariableBusinessQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    type: Joi.string().valid("dynamics", "constant", "system"),
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

  req.params.businessId = Number(req.params.businessId);
  req.body.accountId = req.user?.id!;
  next();
};
