import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateCampaignParameterBodyDTO_I,
  UpdateCampaignParameterParamsDTO_I,
} from "./DTO";

export const updateCampaignParameterValidation = (
  req: Request<
    UpdateCampaignParameterParamsDTO_I,
    any,
    UpdateCampaignParameterBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    subUserUid: Joi.string(),
    name: Joi.string(),
    sendDuringHoliday: Joi.boolean(),
    timesWork: Joi.array()
      .items(
        Joi.object({
          id: Joi.alternatives().try(Joi.number(), Joi.string()),
          endTime: Joi.string().allow(null).optional(),
          startTime: Joi.string().allow(null).optional(),
          dayOfWeek: Joi.number(),
        })
      )
      .optional(),
    rangeId: Joi.number(),
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

  req.params.id = Number(req.params.id);

  next();
};
