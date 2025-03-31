import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdatePasswordHumanServiceDTO_I } from "./DTO";

export const updatePasswordHumanServiceValidation = (
  req: Request<any, any, UpdatePasswordHumanServiceDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    password: Joi.string().min(8).required().messages({
      "any.required": "Campo é obrigatório",
      "string.empty": "Campo não pode ser vazio",
    }),
    confirmPassword: Joi.string().min(8).required().messages({
      "any.required": "Campo é obrigatório",
      "string.empty": "Campo não pode ser vazio",
    }),
    type: Joi.string()
      .regex(/^(attendant|supervisor)$/)
      .required(),
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

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({
      message: "Dados de acesso incorretos",
      status: 400,
      errors: [
        {
          message: "Senhas não conferem",
          path: ["password"],
        },
        {
          message: "Senhas não conferem",
          path: ["confirmPassword"],
        },
      ],
    });
  }

  next();
};
