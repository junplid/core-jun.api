import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  DeleteBatchSupervisorBodyDTO_I,
  DeleteBatchSupervisorParamsDTO_I,
} from "./DTO";

export const deleteBatchSupervisorValidation = (
  req: Request<
    DeleteBatchSupervisorParamsDTO_I,
    any,
    DeleteBatchSupervisorBodyDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    batch: Joi.string()
      .regex(/^\d+(?:-\d+)*$/)
      .required(),
    accountId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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

  req.params.batch = String(req.params.batch)
    .split("-")
    .map((e) => Number(e));

  next();
};
