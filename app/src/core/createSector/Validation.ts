import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateSectorDTO_I } from "./DTO";

export const createSectorValidation = (
  req: Request<any, any, CreateSectorDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    accountId: Joi.number().required(),
    name: Joi.string().required(),
    businessId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
    messageOutsideOfficeHours: Joi.string(),
    typeDistribution: Joi.string()
      .regex(/^(normal|sequential|balanced)$/)
      .required(),
    maximumService: Joi.number().min(0),
    operatingDays: Joi.array().items(
      Joi.string().regex(/^(seg|ter|qua|qui|sex|sab|dom)$/)
    ),
    status: Joi.boolean(),
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
      valueDuration: Joi.number().required(),
      typeDuration: Joi.string()
        .regex(/^(minutes|hours)$/)
        .required(),
      typeBehavior: Joi.string()
        .regex(/^(sendSector|sendAttendant|sendFlow|sendMessage|finish)$/)
        .required(),
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
    funnelKanbanId: Joi.number().required(),
    allowedConnections: Joi.array().items(Joi.number()),
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

  next();
};
