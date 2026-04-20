import { NextFunction, Request, Response } from "express";
import {
  CloseTableBodyDTO_I,
  CloseTableParamsDTO_I,
  CloseTableQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const closeTableValidation = (
  req: Request<
    CloseTableParamsDTO_I,
    any,
    CloseTableBodyDTO_I,
    CloseTableQueryDTO_I
  >,
  _res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    tableId: Joi.number().required(),
    payment_method: Joi.valid(
      "Dinheiro",
      "PIX",
      "Crédito",
      "Débito",
    ).required(),
    add_price: Joi.number().allow(null).optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
    { abortEarly: false, convert: true },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return _res.status(400).json({ errors });
  }

  req.body.accountId = req.user?.id!;
  req.params.tableId = validation.value.tableId;
  req.query.add_price = validation.value.add_price;
  next();
};
