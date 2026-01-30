import { NextFunction, Request, Response } from "express";
import {
  GetInboxDepartmentBodyDTO_I,
  GetInboxDepartmentParamsDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const getInboxDepartmentValidation = (
  req: Request<GetInboxDepartmentParamsDTO_I, any, GetInboxDepartmentBodyDTO_I>,
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
