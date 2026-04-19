import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { DeleteTableBodyDTO_I, DeleteTableParamsDTO_I } from "./DTO";

export const deleteTableValidation = (
  req: Request<DeleteTableParamsDTO_I, any, DeleteTableBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
    { abortEarly: false, convert: true },
  );

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  req.params.id = validation.value.id;
  req.body.accountId = req.user?.id!;

  next();
};
