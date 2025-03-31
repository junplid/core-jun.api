import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateHelpSessionBodyDTO_I,
  UpdateHelpSessionParamsDTO_I,
} from "./DTO";

export const updateHelpSessionValidation = (
  req: Request<UpdateHelpSessionParamsDTO_I, any, UpdateHelpSessionBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    text: Joi.string().required(),
    page: Joi.string()
      .regex(
        /^(about-whabot|faq|report-bugs-and-suggestions|support-contacts|whats-new|help-center|whabot-university|terms-and-conditions)$/
      )
      .required(),
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
