import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateInboxUsersDTO_I } from "./DTO";

export const createInboxUsersValidation = (
  req: Request<any, any, CreateInboxUsersDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(8).required(),
    inboxDepartmentId: Joi.number().optional(),
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
