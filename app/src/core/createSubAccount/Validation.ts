import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateSubAccountDTO_I } from "./DTO";

export const createSubAccountValidation = (
  req: Request<any, any, CreateSubAccountDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const modulesPermissions = Joi.object({
    campaign: Joi.boolean(),
    business: Joi.boolean(),
    subUserUid: Joi.string().optional(),
    sector: Joi.boolean(),
    sectorAttendants: Joi.boolean(),
    flows: Joi.boolean(),
    emailService: Joi.boolean(),
    chatbot: Joi.boolean(),
    campaignAudience: Joi.boolean(),
    contactWAOnAccount: Joi.boolean(),
    uploadFile: Joi.boolean(),
    checkpoint: Joi.boolean(),
    integration: Joi.boolean(),
    dataFlow: Joi.boolean(),
    campaignOndemand: Joi.boolean(),
    campaignParameters: Joi.boolean(),
    connections: Joi.boolean(),
    supervisors: Joi.boolean(),
    servicesConfig: Joi.boolean(),
    users: Joi.boolean(),
    tags: Joi.boolean(),
    variables: Joi.boolean(),
    customizationLink: Joi.boolean(),
  }).optional();

  const schemaValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().max(50).required(),
    accountId: Joi.number().required(),
    status: Joi.number().valid(0, 1).optional().default(1),
    permissions: Joi.object({
      create: modulesPermissions,
      update: modulesPermissions,
      delete: modulesPermissions,
    }).optional(),
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

  if (req.body.status !== undefined) req.body.status = !!req.body.status;

  next();
};
