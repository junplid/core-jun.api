import { NextFunction, Request, Response } from "express";
import {
  UpdateVariableBodyDTO_I,
  UpdateVariableParamsDTO_I,
  UpdateVariableQueryDTO_I,
} from "./DTO";
import { Joi } from "express-validation";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const updateVariableValidation = (
  req: Request<
    UpdateVariableParamsDTO_I,
    any,
    UpdateVariableBodyDTO_I,
    UpdateVariableQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    id: Joi.number().required(),
    value: Joi.string(),
    name: Joi.string(),
    type: Joi.string().valid("constant", "dynamics"),
    businessIds: Joi.array().items(Joi.number()).optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query, ...req.params },
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

  if (req.query.type === "constant" && !req.query.value) {
    const { statusCode, ...rest } = new ErrorResponse(400)
      .input({
        text: "Campo obrigatório.",
        path: "value",
      })
      .getResponse();

    return res.status(statusCode).json(rest);
  }

  req.params.id = Number(req.params.id);
  if (req.query.businessIds?.length) {
    req.query.businessIds = req.query.businessIds.map((s) => Number(s));
  }
  next();
};
