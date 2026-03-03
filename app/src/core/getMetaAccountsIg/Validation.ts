import { NextFunction, Request, Response } from "express";
import { GetAccountsIgDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getAccountsIgValidation = (
  req: Request<any, any, GetAccountsIgDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    access_token: Joi.string().required(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

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
