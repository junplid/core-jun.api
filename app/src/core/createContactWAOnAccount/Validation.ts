import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { validatePhoneNumber } from "../../helpers/validatePhoneNumber";
import { CreateContactWAOnAccountDTO_I } from "./DTO";

export const createContactWAOnAccountValidation = (
  req: Request<any, any, CreateContactWAOnAccountDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const schemaValidation = Joi.object({
    name: Joi.string().required(),
    number: Joi.string().required(),
    accountId: Joi.number().required(),
    businessId: Joi.array().items(Joi.number()).optional(),
    variables: Joi.object().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    subUserUid: Joi.string().optional(),
    isCheck: Joi.boolean().optional(),
  });

  if (req.body.name.length > 150) {
    req.body.name = req.body.name.slice(0, 149);
  }

  if (req.body.tags?.length) {
    req.body.tags = req.body.tags.map((t) => {
      return t.slice(0, 149);
    });
  }

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  const number = validatePhoneNumber(req.body.number, { removeNine: true });

  if (!number) {
    return res.status(200).json({
      message: "OK!",
      status: 200,
      contactsWAOnAccountId: null,
    });
  } else {
    req.body.completeNumber = number;
  }

  next();
};
