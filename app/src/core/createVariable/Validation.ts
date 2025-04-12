import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateVariableDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createVariableValidation = (
  req: Request<any, any, CreateVariableDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    type: Joi.string().valid("dynamics", "constant").required(),
    name: Joi.string().required(),
    value: Joi.string().allow(""),
    targetId: Joi.number(),
    accountId: Joi.number().required(),
    businessIds: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  if (req.body.type === "constant" && !req.body.value) {
    const { statusCode, ...rest } = new ErrorResponse(400)
      .input({
        text: "Campo obrigatório.",
        path: "value",
      })
      .getResponse();

    return res.status(statusCode).json(rest);
  }

  next();
};
