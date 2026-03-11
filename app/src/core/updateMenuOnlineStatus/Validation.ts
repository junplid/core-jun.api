import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateMenuOnlineStatusBodyDTO_I,
  UpdateMenuOnlineStatusParamsDTO_I,
} from "./DTO";

export const updateMenuOnlineStatusValidation = (
  req: Request<
    UpdateMenuOnlineStatusParamsDTO_I,
    any,
    UpdateMenuOnlineStatusBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    status: Joi.boolean().required(),
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
