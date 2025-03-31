import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { UpdateSectorBodyDTO_I, UpdateSectorParamsDTO_I } from "./DTO";

export const updateSectorValidation = (
  req: Request<UpdateSectorParamsDTO_I, any, UpdateSectorBodyDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string(),
    businessId: Joi.number(),
    status: Joi.boolean(),
    subUserUid: Joi.string(),
    messageOutsideOfficeHours: Joi.string(),
    typeDistribution: Joi.string().valid("normal", "sequential", "balanced"),
    maximumService: Joi.number().min(0),
    operatingDays: Joi.array().items(
      Joi.string().valid("seg", "ter", "qua", "qui", "sex", "sab", "dom")
    ),
    signBusiness: Joi.boolean(),
    signSector: Joi.boolean(),
    signAttendant: Joi.boolean(),
    timeToSendToAllSectors: Joi.number(),
    fromTime: Joi.string().regex(/^\d{2}:\d{2}$/),
    toTime: Joi.string().regex(/^\d{2}:\d{2}$/),
    supervisorsId: Joi.number(),
    addTag: Joi.boolean(),
    removeTicket: Joi.boolean(),
    previewPhone: Joi.boolean(),
    sectorsAttendantsIds: Joi.array().items(Joi.number()),
    lackResponse: Joi.object({
      valueDuration: Joi.number(),
      typeDuration: Joi.string().valid("minutes", "hours"),
      typeBehavior: Joi.string().valid(
        "sendSector",
        "sendAttendant",
        "sendFlow",
        "sendMessage",
        "finish"
      ),
      sendAttendant: Joi.number(),
      sendSector: Joi.number(),
      sendFlow: Joi.number(),
      sendMessage: Joi.string(),
      finish: Joi.boolean(),
    }),
    sectorsMessages: Joi.object({
      messageWelcome: Joi.string(),
      messageWelcomeToOpenTicket: Joi.string(),
      messageFinishService: Joi.string(),
      messageTransferTicket: Joi.string(),
    }),
    funnelKanbanId: Joi.number(),
    allowedConnections: Joi.array().items(Joi.number()),
  });

  const validation = schemaValidation.validate(
    { ...req.body, ...req.params },
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
