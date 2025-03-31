import { NextFunction, Request, Response } from "express";
import { GetCampaignsBodyDTO_I, GetCampaignsQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getCampaignsValidation = (
  req: Request<any, any, GetCampaignsBodyDTO_I, GetCampaignsQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    isOndemand: Joi.number(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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

  if (req.query.isOndemand) {
    req.query.isOndemand = Number(req.query.isOndemand);
  }

  next();
};
