import { Joi } from "express-validation";
import { Request, Response, NextFunction } from "express";
import { UpdateSubAccountBodyDTO_I, UpdateSubAccountParamsDTO_I } from "./DTO";

export const updateSubAccountValidation = (
  req: Request<UpdateSubAccountParamsDTO_I, any, UpdateSubAccountBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const modulesPermissions = Joi.object({
    campaign: Joi.boolean().optional(),
    business: Joi.boolean().optional(),
    subUserUid: Joi.string().optional().optional(),
    sector: Joi.boolean().optional(),
    sectorAttendants: Joi.boolean().optional(),
    flows: Joi.boolean().optional(),
    emailService: Joi.boolean().optional(),
    chatbot: Joi.boolean().optional(),
    campaignAudience: Joi.boolean().optional(),
    contactWAOnAccount: Joi.boolean().optional(),
    uploadFile: Joi.boolean().optional(),
    checkpoint: Joi.boolean().optional(),
    integration: Joi.boolean().optional(),
    dataFlow: Joi.boolean().optional(),
    campaignOndemand: Joi.boolean().optional(),
    campaignParameters: Joi.boolean().optional(),
    connections: Joi.boolean().optional(),
    supervisors: Joi.boolean().optional(),
    servicesConfig: Joi.boolean().optional(),
    users: Joi.boolean().optional(),
    tags: Joi.boolean().optional(),
    variables: Joi.boolean().optional(),
    customizationLink: Joi.boolean().optional(),
  }).optional();

  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    name: Joi.string().max(50).optional(),
    status: Joi.number().valid(0, 1).optional(),
    permissions: Joi.object({
      create: modulesPermissions,
      update: modulesPermissions,
      delete: modulesPermissions,
    }).optional(),
  });

  const validation = schemaValidation.validate(
    { ...req.query, ...req.params, ...req.body },
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
  if (req.body.status !== undefined) {
    req.body.status = !!req.body.status;
  }
  next();
};
