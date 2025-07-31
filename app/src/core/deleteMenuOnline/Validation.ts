import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { DeleteMenuOnlineBodyDTO_I, DeleteMenuOnlineParamsDTO_I } from "./DTO";

export const deleteMenuOnlineValidation = (
  req: Request<DeleteMenuOnlineParamsDTO_I, any, DeleteMenuOnlineBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    uuid: Joi.string().required(),
    accountId: Joi.number().required(),
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

  next();
};
