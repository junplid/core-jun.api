import { NextFunction, Request, Response } from "express";
import { DeleteTableItemBodyDTO_I, DeleteTableItemParamsDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const deleteTableItemValidation = (
  req: Request<DeleteTableItemParamsDTO_I, any, DeleteTableItemBodyDTO_I>,
  _res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    tableId: Joi.number().required(),
    ItemOfOrderId: Joi.number().required(),
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
    return _res.status(400).json({ errors });
  }

  req.body.accountId = req.user?.id!;
  req.params = validation.value;
  next();
};
