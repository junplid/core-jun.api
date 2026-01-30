import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import {
  UpdateConnectionWABodyDTO_I,
  UpdateConnectionWAParamsDTO_I,
} from "./DTO";

export const updateConnectionWAValidation = (
  req: Request<UpdateConnectionWAParamsDTO_I, any, UpdateConnectionWABodyDTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    businessId: Joi.number().optional(),
    description: Joi.string().allow(""),
    name: Joi.string().optional(),
    type: Joi.string().valid("chatbot", "marketing").optional(),
    profileName: Joi.string().allow(""),
    profileStatus: Joi.string().allow(""),
    lastSeenPrivacy: Joi.string().valid(
      "all",
      "contacts",
      "contact_blacklist",
      "none",
    ),
    onlinePrivacy: Joi.string().valid("all", "match_last_seen"),
    imgPerfilPrivacy: Joi.string().valid(
      "all",
      "contacts",
      "contact_blacklist",
      "none",
    ),
    statusPrivacy: Joi.string().valid(
      "all",
      "contacts",
      "contact_blacklist",
      "none",
    ),
    groupsAddPrivacy: Joi.string().valid(
      "all",
      "contacts",
      "contact_blacklist",
    ),
    readReceiptsPrivacy: Joi.string().valid("all", "none").allow(""),
    fileNameImage: Joi.string().allow(""),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params, ...req.query },
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

  req.params.id = Number(req.params.id);
  if (req.body.businessId) {
    req.body.businessId = Number(req.body.businessId);
  }
  req.body.fileNameImage = req.file?.filename;
  req.body.accountId = req.user?.id!;
  next();
};
