import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateConnectionWAUserBodyDTO_I,
  UpdateConnectionWAUserParamsDTO_I,
  UpdateConnectionWAUserQueryDTO_I,
} from "./DTO";

export const updateConnectionWAUserValidation = (
  req: Request<
    UpdateConnectionWAUserParamsDTO_I,
    any,
    UpdateConnectionWAUserBodyDTO_I,
    UpdateConnectionWAUserQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    profileName: Joi.string()
      .messages({
        "string.empty": "Campo não pode estar vazio",
      })
      .optional(),
    profileStatus: Joi.string()
      .messages({
        "string.empty": "Campo não pode estar vazio",
      })
      .optional(),
    lastSeenPrivacy: Joi.string()
      .regex(/^(all|contacts|contact_blacklist|none)$/)
      .messages({
        "string.empty": "Campo não pode estar vazio",
        "string.pattern.base": "Valor inválido",
      })
      .optional(),
    onlinePrivacy: Joi.string()
      .regex(/^(all|match_last_seen)$/)
      .messages({
        "string.empty": "Campo não pode estar vazio",
        "string.pattern.base": "Valor inválido",
      })
      .optional(),
    imgPerfilPrivacy: Joi.string()
      .regex(/^(all|contacts|contact_blacklist|none)$/)
      .messages({
        "string.empty": "Campo não pode estar vazio",
        "string.pattern.base": "Valor inválido",
      })
      .optional(),
    statusPrivacy: Joi.string()
      .regex(/^(all|contacts|contact_blacklist|none)$/)
      .messages({
        "string.empty": "Campo não pode estar vazio",
        "string.pattern.base": "Valor inválido",
      })
      .optional(),

    groupsAddPrivacy: Joi.string()
      .regex(/^(all|contacts|contact_blacklist)$/)
      .messages({
        "string.empty": "Campo não pode estar vazio",
        "string.pattern.base": "Valor inválido",
      })
      .optional(),
    readReceiptsPrivacy: Joi.string()
      .regex(/^(all|none)$/)
      .messages({
        "string.empty": "Campo não pode estar vazio",
        "string.pattern.base": "Valor inválido",
      })
      .optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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
