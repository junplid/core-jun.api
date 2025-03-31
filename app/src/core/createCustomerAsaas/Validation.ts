import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateCustomerAsaasDTO_I } from "./DTO";
import { isCNPJ, isCPF } from "validation-br";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const createCustomerAsaasValidation = (
  req: Request<any, any, CreateCustomerAsaasDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    cpfCnpj: Joi.string().required(),
    name: Joi.string().required(),
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

  if (!isCNPJ(req.body.cpfCnpj) && !isCPF(req.body.cpfCnpj)) {
    const { statusCode, ...err } = new ErrorResponse(400)
      .input({ path: "cpfCnpj", text: "CPF ou CNPJ inválido." })
      .getResponse();
    return res.status(400).json(err);
  }

  next();
};
