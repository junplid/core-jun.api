import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdatePasswordAccountDTO_I } from "./DTO";

export const updatePasswordAccountValidation = (
  req: Request<any, any, UpdatePasswordAccountDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    password: Joi.string().required().messages({
      "any.required": "Campo é obrigatório",
      "string.empty": "Campo não pode ser vazio",
    }),
    confirmPassword: Joi.string().required().messages({
      "any.required": "Campo é obrigatório",
      "string.empty": "Campo não pode ser vazio",
    }),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.query },
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
  req.body.accountId = req.user?.id!;
  next();
};
