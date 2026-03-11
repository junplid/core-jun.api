import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateMenuOnlineCategoryBodyDTO_I,
  UpdateMenuOnlineCategoryParamsDTO_I,
} from "./DTO";

export const updateMenuOnlineCategoryValidation = (
  req: Request<
    UpdateMenuOnlineCategoryParamsDTO_I,
    any,
    UpdateMenuOnlineCategoryBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    categoryUuid: Joi.string().required(),
    name: Joi.string().optional(),
    image45x45png: Joi.string().optional(),
    startAt: Joi.date().iso().optional().allow(null),
    endAt: Joi.date().iso().optional().allow(null),
    days_in_the_week: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(
    {
      ...req.body,
      ...req.params,
      days_in_the_week: JSON.parse(String(req.body.days_in_the_week)),
      image45x45png: req.file?.filename,
    },
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

  req.body.accountId = req.user?.id!;
  req.body.days_in_the_week = validation.value.days_in_the_week;

  next();
};
