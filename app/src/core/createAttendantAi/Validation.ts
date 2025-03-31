import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateAttendantAiDTO_I } from "./DTO";

export const createAttendantAiValidation = (
  req: Request<any, any, CreateAttendantAiDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    accountId: Joi.number().required(),
    aiId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).required(),
    briefing: Joi.string().allow(""),
    personality: Joi.string().allow(""),
    role: Joi.string().allow(""),
    definitions: Joi.string().allow(""),
    knowledgeBase: Joi.string().allow(""),
    files: Joi.array()
      .items(
        Joi.object({
          filename: Joi.string(),
          originalname: Joi.string(),
        })
      )
      .optional(),
  });

  const validation = schemaValidation.validate(
    {
      ...req.body,
      businessIds: Array.isArray(req.body.businessIds)
        ? req.body.businessIds.map((s) => s)
        : [req.body.businessIds],
    },
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

  req.body.businessIds = Array.isArray(req.body.businessIds)
    ? req.body.businessIds.map((s) => Number(s))
    : [Number(req.body.businessIds)];
  next();
};
