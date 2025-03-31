import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateParameterDTO_I } from "./DTO";

export const createParameterValidation = (
  req: Request<any, any, CreateParameterDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    sendDuringHoliday: Joi.boolean().required(),
    timesWork: Joi.array().items(
      Joi.object({
        endTime: Joi.string().optional(),
        startTime: Joi.string().optional(),
        dayOfWeek: Joi.number().required(),
      })
    ),
    rangeId: Joi.number().required(),
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
  });

  const validation = schemaValidation.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.body.rangeId = Number(req.body.rangeId);

  next();
};
