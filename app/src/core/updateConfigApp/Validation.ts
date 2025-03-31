import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateConfigAppDTO_I } from "./DTO";

export const updateConfigAppValidation = (
  req: Request<any, any, UpdateConfigAppDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const data = { ...req.body, ...req.query, ...req.params };
  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    name: Joi.string().optional().allow("").messages({
      "string.base": "O campo name deve ser uma string",
    }),
    labelFooter: Joi.string().optional().allow("").messages({
      "string.base": "O campo labelFooter deve ser uma string",
    }),
    fileName: Joi.string().optional().allow("").messages({
      "string.base": "O campo fileName deve ser uma string",
    }),
    "url-plataform-adm": Joi.string().optional().allow("").messages({
      "string.base": "O campo URL ADM deve ser uma string",
    }),
    "url-plataform-ah": Joi.string().optional().allow("").messages({
      "string.base": "O campo URL AH deve ser uma string",
    }),
    labelMenuLateral: Joi.string().optional().allow(""),
    labelBarraSuperior: Joi.string().optional().allow(""),
  });

  const validation = schemaValidation.validate(data, { abortEarly: false });

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
