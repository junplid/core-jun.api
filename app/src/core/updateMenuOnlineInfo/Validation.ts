import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateMenuOnlineInfoBodyDTO_I,
  UpdateMenuOnlineInfoParamsDTO_I,
} from "./DTO";

export const updateMenuOnlineInfoValidation = (
  req: Request<
    UpdateMenuOnlineInfoParamsDTO_I,
    any,
    UpdateMenuOnlineInfoBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    state_uf: Joi.string().optional().allow("", null),
    address: Joi.string().optional().allow("", null),
    city: Joi.string().optional().allow("", null),
    phone_contact: Joi.string().optional().allow("", null),
    whatsapp_contact: Joi.string().optional().allow("", null),
    payment_methods: Joi.array().items(
      Joi.string().valid("Dinheiro", "Pix", "Cartao_Credito", "Cartao_Debito"),
    ),
    delivery_fee: Joi.number().empty(["", null]).default(null),
  });

  const validation = schemaValidation.validate(
    {
      ...req.body,
      ...req.params,
      ...req.query,
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
  next();
};
