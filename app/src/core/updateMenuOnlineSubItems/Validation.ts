import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateMenuOnlineSubItemsStatusBodyDTO_I,
  UpdateMenuOnlineSubItemsStatusParamsDTO_I,
} from "./DTO";

export const updateMenuOnlineSubItemsStatusValidation = (
  req: Request<
    UpdateMenuOnlineSubItemsStatusParamsDTO_I,
    any,
    UpdateMenuOnlineSubItemsStatusBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    subItemsUuid: Joi.array().items(Joi.string()).min(1).required(),
    action: Joi.string().valid("true", "false").required(),
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

  req.body.accountId = req.user?.id!;
  next();
};
