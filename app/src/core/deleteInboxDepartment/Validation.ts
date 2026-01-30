import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteInboxDepartmentBodyDTO_I,
  DeleteInboxDepartmentParamsDTO_I,
} from "./DTO";

export const deleteInboxDepartmentValidation = (
  req: Request<
    DeleteInboxDepartmentParamsDTO_I,
    any,
    DeleteInboxDepartmentBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
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

  req.params.id = Number(req.params.id);
  req.body.accountId = req.user?.id!;

  next();
};
