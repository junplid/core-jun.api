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
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    type_delivery: Joi.string().valid("retirar", "enviar"),
    delivery_address: Joi.string().max(120).allow(""),
    delivery_complement: Joi.string().max(60).allow(""),
    delivery_reference_point: Joi.string().max(120).allow(""),
    delivery_cep: Joi.string().max(9).allow(""),
    delivery_number: Joi.string().max(10).allow(""),
    delivery_lat: Joi.number().allow("", null),
    delivery_lng: Joi.number().allow("", null),
    payment_method: Joi.string().max(18).required(),
    who_receives: Joi.string().max(35).allow(""),
    payment_change_to: Joi.string().allow(null),
    items: Joi.array().items(
      Joi.object({
        qnt: Joi.number().required(),
        obs: Joi.string().max(130).allow(""),
        uuid: Joi.string().required(),
        sections: Joi.object()
          .pattern(
            Joi.string(),
            Joi.object().pattern(Joi.string(), Joi.number().integer().min(0)),
          )
          .optional(),
      }),
    ),
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

  next();
};
