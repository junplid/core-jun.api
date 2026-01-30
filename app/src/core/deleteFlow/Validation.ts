import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { DeleteFlowBodyDTO_I, DeleteFlowParamsDTO_I } from "./DTO";

export const deleteFlowValidation = (
  req: Request<DeleteFlowParamsDTO_I, any, DeleteFlowBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    flowId: Joi.string().required(),
    subUserUid: Joi.string().optional(),
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
  req.body.accountId = req.user?.id!;

  next();
};
