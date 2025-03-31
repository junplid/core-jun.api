import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { GetPlanBodyDTO_I, GetPlanParamsDTO_I, GetPlanQueryDTO_I } from "./DTO";

export const getPlanValidation = (
  req: Request<GetPlanParamsDTO_I, any, GetPlanBodyDTO_I, GetPlanQueryDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().optional(),
    affiliate: Joi.string().optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.params, ...req.body, ...req.query },
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

  req.params.id = Number(req.params.id);

  next();
};
