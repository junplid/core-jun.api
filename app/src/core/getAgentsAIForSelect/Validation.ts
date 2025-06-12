import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  GetAgentsAIForSelectBodyDTO_I,
  GetAgentsAIForSelectQueryDTO_I,
} from "./DTO";

export const getAgentsAIForSelectValidation = (
  req: Request<
    any,
    any,
    GetAgentsAIForSelectBodyDTO_I,
    GetAgentsAIForSelectQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().allow(""),
    businessIds: Joi.array().items(Joi.number()).optional(),
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

  req.query.businessIds = req.query.businessIds?.map((b) => Number(b));

  next();
};
