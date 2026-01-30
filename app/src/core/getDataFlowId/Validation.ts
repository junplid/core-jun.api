import { NextFunction, Request, Response } from "express";
import { GetDataFlowIdBodyDTO_I, GetDataFlowIdParamsDTO_I } from "./DTO";
import { Joi } from "express-validation";

export const getDataFlowIdValidation = (
  req: Request<GetDataFlowIdParamsDTO_I, any, GetDataFlowIdBodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.string().required(),
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
