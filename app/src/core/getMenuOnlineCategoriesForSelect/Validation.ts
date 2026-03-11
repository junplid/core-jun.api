import { NextFunction, Request, Response } from "express";
import {
  GetMenuOnlineCategoriesForSelectBodyDTO_I,
  GetMenuOnlineCategoriesForSelectParamsDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getMenuOnlineCategoriesForSelectValidation = (
  req: Request<
    GetMenuOnlineCategoriesForSelectParamsDTO_I,
    any,
    GetMenuOnlineCategoriesForSelectBodyDTO_I,
    any
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
  });

  const validation = schemaValidation.validate(req.params, {
    abortEarly: false,
  });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  if (req.query.businessIds) {
    req.query.businessIds = String(req.query.businessIds)
      .split("-")
      .map((e) => Number(e));
  }

  if (req.query.status) {
    req.query.status = !!Number(req.query.status);
  }
  req.body.accountId = req.user?.id!;

  next();
};
