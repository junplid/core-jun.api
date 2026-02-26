import { NextFunction, Request, Response } from "express";
import { GetAgentTemplatesBodyDTO_I, GetAgentTemplatesQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getAgentTemplatesValidation = (
  req: Request<
    any,
    any,
    GetAgentTemplatesBodyDTO_I,
    GetAgentTemplatesQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    limit: Joi.number().default(4).min(1).optional(),
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
  req.body.accountId = req.user?.id;
  req.query.limit = validation.value.limit;

  next();
};
