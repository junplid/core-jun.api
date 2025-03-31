import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateAttendantAiDTO_I } from "./DTO";

export const updateAttendantAiValidation = (
  req: Request<any, any, UpdateAttendantAiDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    name: Joi.string(),
    description: Joi.string().allow(""),
    aiId: Joi.number(),
    businessIds: Joi.array().items(Joi.number()).optional(),
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
      businessIds: req.body.businessIds
        ? Array.isArray(req.body.businessIds)
          ? req.body.businessIds.map((s) => s)
          : [req.body.businessIds]
        : undefined,
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

  req.body.id = Number(req.body.id);
  if (req.body.businessIds) {
    req.body.businessIds = Array.isArray(req.body.businessIds)
      ? req.body.businessIds.map((s) => Number(s))
      : [Number(req.body.businessIds)];
  }

  next();
};
