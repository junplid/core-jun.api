import { Joi } from "express-validation";
import { Request, Response, NextFunction } from "express";
import {
  UpdateSectorsAttendantBodyDTO_I,
  UpdateSectorsAttendantParamsDTO_I,
  UpdateSectorsAttendantQueryDTO_I,
} from "./DTO";

export const updateSectorsAttendantValidation = (
  req: Request<
    UpdateSectorsAttendantParamsDTO_I,
    any,
    UpdateSectorsAttendantBodyDTO_I,
    UpdateSectorsAttendantQueryDTO_I
  >,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    id: Joi.number().required(),
    accountId: Joi.number().required(),
    name: Joi.string().optional(),
    office: Joi.string().optional(),
    username: Joi.string().email().optional(),
    password: Joi.string().optional(),
    previewTicketSector: Joi.boolean(),
    previewTicketBusiness: Joi.boolean(),
    allowInsertionAndRemovalOfTags: Joi.boolean(),
    allowToUseQuickMessages: Joi.boolean(),
    allowReOpeningATicket: Joi.boolean(),
    allowStartingNewTicket: Joi.boolean(),
    allowAddingNotesToLeadProfile: Joi.boolean(),
    status: Joi.number().valid(0, 1).optional(),
    sectorsId: Joi.number(),
    businessId: Joi.number().optional(),
    subUserUid: Joi.string().optional(),
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

  if (req.query.previewTicketSector) {
    req.query.previewTicketSector = JSON.parse(
      String(req.query.previewTicketSector)
    );
  }
  if (req.query.allowReOpeningATicket) {
    req.query.allowReOpeningATicket = JSON.parse(
      String(req.query.allowReOpeningATicket)
    );
  }
  if (req.query.previewTicketBusiness) {
    req.query.previewTicketBusiness = JSON.parse(
      String(req.query.previewTicketBusiness)
    );
  }
  if (req.query.allowToUseQuickMessages) {
    req.query.allowToUseQuickMessages = JSON.parse(
      String(req.query.allowToUseQuickMessages)
    );
  }
  if (req.query.allowAddingNotesToLeadProfile) {
    req.query.allowAddingNotesToLeadProfile = JSON.parse(
      String(req.query.allowAddingNotesToLeadProfile)
    );
  }
  if (req.query.allowInsertionAndRemovalOfTags) {
    req.query.allowInsertionAndRemovalOfTags = JSON.parse(
      String(req.query.allowInsertionAndRemovalOfTags)
    );
  }
  if (req.query.allowStartingNewTicket) {
    req.query.allowStartingNewTicket = JSON.parse(
      String(req.query.allowStartingNewTicket)
    );
  }

  if (req.query.businessId) req.query.businessId = Number(req.query.businessId);
  req.params.id = Number(req.params.id);
  if (req.query.sectorsId) req.query.sectorsId = Number(req.query.sectorsId);
  next();
};
