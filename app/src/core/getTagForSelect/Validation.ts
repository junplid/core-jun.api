import { NextFunction, Request, Response } from "express";
import { GetTagForSelectBodyDTO_I, GetTagForSelectQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getTagForSelectValidation = (
  req: Request<any, any, GetTagForSelectBodyDTO_I, GetTagForSelectQueryDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    type: Joi.string().valid("contactwa", "audience"),
    businessIds: Joi.array().items(Joi.number()),
    name: Joi.string(),
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

  if (req.query.businessIds?.length) {
    req.query.businessIds = req.query.businessIds.map((b) => Number(b));
  }
  req.body.accountId = req.user?.id!;
  next();
};
