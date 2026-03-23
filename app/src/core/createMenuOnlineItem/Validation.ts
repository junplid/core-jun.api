import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  CreateMenuOnlineItemBodyDTO_I,
  CreateMenuOnlineItemParamsDTO_I,
} from "./DTO";

export const createMenuOnlineItemValidation = (
  req: Request<
    CreateMenuOnlineItemParamsDTO_I,
    any,
    CreateMenuOnlineItemBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const resolverNumberNull = Joi.number().empty(["", null]).default(null);
  const resolverPrice = Joi.custom((value) => {
    if (typeof value === "string") {
      const apenasNumero = value.replace(/\D/g, "");
      if (!apenasNumero) return null;
      if (apenasNumero.length < 3) {
        return Number(apenasNumero);
      } else {
        return Number(apenasNumero) / 100;
      }
    }
  }).default(null);

  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),

    name: Joi.string().required(),
    send_to_category_uuid: Joi.string().allow("", null).optional(),
    desc: Joi.string().allow(""),
    fileNameImage: Joi.string().required(),
    qnt: Joi.number().min(0),
    beforePrice: resolverPrice,
    afterPrice: resolverPrice,
    categoriesUuid: Joi.array().items(Joi.string()).optional(),
    date_validity: Joi.date().iso().optional(),

    sections: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().optional().allow(""),
          helpText: Joi.string().optional().allow(""),
          required: Joi.boolean().optional(),
          minOptions: resolverNumberNull,
          maxOptions: resolverNumberNull,

          subItems: Joi.array()
            .items(
              Joi.object({
                image55x55png: Joi.string().allow("", null).optional(),
                name: Joi.string().required(),
                desc: Joi.string().allow("").optional(),
                status: Joi.boolean().required(),
                before_additional_price: resolverPrice,
                after_additional_price: resolverPrice,
                maxLength: resolverNumberNull,
              }),
            )
            .min(1)
            .required(),
        }),
      )
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false, convert: true },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.body = {
    ...validation.value,
    accountId: req.user?.id!,
  };
  next();
};
