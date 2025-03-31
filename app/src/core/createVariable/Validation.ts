import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateVariableDTO_I } from "./DTO";

export const createVariableValidation = (
  req: Request<any, any, CreateVariableDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    type: Joi.string().valid("dynamics", "constant").required(),
    name: Joi.string().required(),
    value: Joi.string(),
    targetId: Joi.number(),
    subUserUid: Joi.string().optional(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().min(1).items(Joi.number()).required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  if (req.body.type === "constant" && !req.body.value) {
    const schemaValidation = Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required(),
    });

    const { accountId, businessIds, type, ...rest } = req.body;
    const validation = schemaValidation.validate(rest, { abortEarly: false });

    if (validation.error) {
      const errors = validation.error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
        type: detail.type,
      }));
      return res.status(400).json({ errors });
    }
  }

  next();
};
