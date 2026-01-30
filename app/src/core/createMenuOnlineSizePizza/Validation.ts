import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateMenuOnlineSizePizzaBodyDTO_I,
  CreateMenuOnlineSizePizzaParamsDTO_I,
} from "./DTO";

export const createMenuOnlineSizePizzaValidation = (
  req: Request<
    CreateMenuOnlineSizePizzaParamsDTO_I,
    any,
    CreateMenuOnlineSizePizzaBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().required(),
    flavors: Joi.number().required(),
    slices: Joi.number(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  req.body.price = validation.value.price;
  req.body.accountId = req.user?.id!;

  next();
};
