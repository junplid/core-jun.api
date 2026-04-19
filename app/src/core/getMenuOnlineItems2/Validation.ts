import { NextFunction, Request, Response } from "express";
import {
  GetMenuOnlineItems2BodyDTO_I,
  GetMenuOnlineItems2ParamsDTO_I,
  GetMenuOnlineItems2QueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getMenuOnlineItems2Validation = (
  req: Request<
    GetMenuOnlineItems2ParamsDTO_I,
    any,
    GetMenuOnlineItems2BodyDTO_I,
    GetMenuOnlineItems2QueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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
