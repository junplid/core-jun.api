import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateMenuOnlineItemBodyDTO_I,
  UpdateMenuOnlineItemParamsDTO_I,
} from "./DTO";

export const updateMenuOnlineItemValidation = (
  req: Request<
    UpdateMenuOnlineItemParamsDTO_I,
    any,
    UpdateMenuOnlineItemBodyDTO_I
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
    return undefined;
  });

  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    itemUuid: Joi.string().required(),
    name: Joi.string().optional(),
    desc: Joi.string().allow(""),
    fileNameImage: Joi.string().optional(),
    qnt: Joi.number().min(0),
    beforePrice: resolverPrice,
    afterPrice: resolverPrice,
    date_validity: Joi.date().iso().allow(null).optional(),
    categoriesUuid: Joi.array().items(Joi.string()).optional(),

    sections: Joi.array()
      .items(
        Joi.object({
          uuid: Joi.string().required(),
          title: Joi.string().optional(),
          helpText: Joi.string().allow("").optional(),
          required: Joi.boolean().optional(),
          minOptions: resolverNumberNull,
          maxOptions: resolverNumberNull,

          subItems: Joi.array()
            .items(
              Joi.object({
                uuid: Joi.string().required(),
                image55x55png: Joi.string().allow("", null).optional(),
                status: Joi.boolean().allow(null),
                name: Joi.string().optional(),
                desc: Joi.string().allow("").optional(),
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
