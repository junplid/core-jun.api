import { NextFunction, Request, Response } from "express";
import {
  RunActionChannelOrderBodyDTO_I,
  RunActionChannelOrderParamsDTO_I,
} from "./DTO";
import { Joi } from "express-validation";

export const runActionChannelOrderValidation = (
  req: Request<
    RunActionChannelOrderParamsDTO_I,
    any,
    RunActionChannelOrderBodyDTO_I
  >,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    action: Joi.string().required(),
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

  const { account, ...rest } = validation.value;
  req.params = rest;
  req.body.accountId = req.user?.id!;
  next();
};
