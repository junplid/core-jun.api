import { NextFunction, Request, Response } from "express";
import {
  GetContactWAOnAccountBodyDTO_I,
  GetContactWAOnAccountQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getContactWAOnAccountValidation = (
  req: Request<
    any,
    any,
    GetContactWAOnAccountBodyDTO_I,
    GetContactWAOnAccountQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    campaignAudienceIds: Joi.string()
      .regex(/^[0-9]+(-[0-9]+)*$/)
      .optional(),
    limit: Joi.number().max(500),
    page: Joi.number(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  if (req.query.campaignAudienceIds) {
    req.query.campaignAudienceIds = String(req.query.campaignAudienceIds)
      .split("-")
      .map((s) => Number(s));
  }

  if (req.query.limit) req.query.limit = Number(req.query.limit);
  if (req.query.page) req.query.page = Number(req.query.page);

  next();
};
