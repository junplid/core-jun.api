import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateMenuOnlineCategoryBodyDTO_I,
  CreateMenuOnlineCategoryParamsDTO_I,
} from "./DTO";

export const createMenuOnlineCategoryValidation = (
  req: Request<
    CreateMenuOnlineCategoryParamsDTO_I,
    any,
    CreateMenuOnlineCategoryBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    name: Joi.string().required(),
    image45x45png: Joi.string().required(),
    startAt: Joi.date().iso().optional(),
    endAt: Joi.date().iso().optional(),
    days_in_the_week: Joi.array().items(Joi.number()),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, image45x45png: req.file?.filename },
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

  next();
};
