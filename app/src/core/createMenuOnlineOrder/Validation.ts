import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateMenuOnlineOrderBodyDTO_I,
  CreateMenuOnlineOrderParamsDTO_I,
} from "./DTO";

export const createMenuOnlineOrderValidation = (
  req: Request<
    CreateMenuOnlineOrderParamsDTO_I,
    any,
    CreateMenuOnlineOrderBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    delivery_address: Joi.string().allow(""),
    delivery_complement: Joi.string().allow(""),
    delivery_cep: Joi.string().allow(""),
    payment_method: Joi.string().required(),
    who_receives: Joi.string().allow(""),
    items: Joi.array().items(
      Joi.object({
        qnt: Joi.number().required(),
        obs: Joi.string().allow(""),
        flavors: Joi.array()
          .items(
            Joi.object({
              qnt: Joi.number().required(),
              id: Joi.string().required(),
            })
          )
          .optional(),
        id: Joi.string().required(),
        type: Joi.string().valid("pizza", "drink").required(),
      })
    ),
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

  next();
};
