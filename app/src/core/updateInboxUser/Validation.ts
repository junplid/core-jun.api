import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateInboxUserBodyDTO_I,
  UpdateInboxUserParamsDTO_I,
  UpdateInboxUserQueryDTO_I,
} from "./DTO";

export const updateInboxUserValidation = (
  req: Request<
    UpdateInboxUserParamsDTO_I,
    any,
    UpdateInboxUserBodyDTO_I,
    UpdateInboxUserQueryDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().optional(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .optional(),
    password: Joi.string().min(8).optional(),
    inboxDepartmentId: Joi.number().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  req.params.id = Number(req.params.id);
  if (req.query.inboxDepartmentId) {
    req.query.inboxDepartmentId = Number(req.query.inboxDepartmentId);
  }
  req.body.accountId = req.user?.id!;
  next();
};
