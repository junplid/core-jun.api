import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateConnectionWADTO_I } from "./DTO";

export const createConnectionWAValidation = (
  req: Request<any, any, CreateConnectionWADTO_I>,
  res: Response,
  next: NextFunction,
) => {
  const schemaValidation = Joi.object({
    agentId: Joi.number().optional(),
    businessId: Joi.number().required(),
    description: Joi.string().allow(""),
    name: Joi.string().required(),
    type: Joi.string().valid("chatbot", "marketing").required(),
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
  }).required();

  const validation = schemaValidation.validate(
    { ...req.body, fileNameImage: req.file?.filename },
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

  req.body = validation.value;
  req.body.accountId = req.user?.id!;
  next();
};
