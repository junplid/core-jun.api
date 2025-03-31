import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { CreateSectorAttendantDTO_I } from "./DTO";

export const createSectorAttendantValidation = (
  req: Request<any, any, CreateSectorAttendantDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    office: Joi.string().required(),
    username: Joi.string().email().required(),
    password: Joi.string().required(),
    previewTicketSector: Joi.boolean(),
    previewTicketBusiness: Joi.boolean(),
    allowInsertionAndRemovalOfTags: Joi.boolean(),
    allowToUseQuickMessages: Joi.boolean(),
    allowReOpeningATicket: Joi.boolean(),
    allowStartingNewTicket: Joi.boolean(),
    allowAddingNotesToLeadProfile: Joi.boolean(),
    status: Joi.number().valid(0, 1).required(),
    sectorsId: Joi.number(),
    accountId: Joi.number().required(),
    businessId: Joi.number().required(),
    subUserUid: Joi.string().optional(),
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
