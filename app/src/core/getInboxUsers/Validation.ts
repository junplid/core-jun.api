import { NextFunction, Request, Response } from "express";
import { GetInboxUsersBodyDTO_I, GetInboxUsersQueryDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getInboxUsersValidation = (
  req: Request<any, any, GetInboxUsersBodyDTO_I, GetInboxUsersQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
    { abortEarly: false }
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
