import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetIntegrationAiForSelectBodyDTO_I,
  GetIntegrationAiForSelectQueryDTO_I,
} from "./DTO";

export const getIntegrationAiForSelectValidation = (
  req: Request<
    any,
    any,
    GetIntegrationAiForSelectBodyDTO_I,
    GetIntegrationAiForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().allow(""),
    businessIds: Joi.string().regex(/^\d+(-\d+)*$/),
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

  if (req.query.businessIds?.length) {
    req.query.businessIds = (req.query.businessIds as unknown as string)
      .split("-")
      .map((b) => Number(b));
  }

  next();
};
