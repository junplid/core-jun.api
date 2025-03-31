import { NextFunction, Request, Response } from "express";
import { AsaasWebHookChargesDTO_I } from "./DTO";

export const asaasWebHookChargesValidation = (
  req: Request<any, any, AsaasWebHookChargesDTO_I>,
  res: Response,
  next: NextFunction
) => {
  // const keySchema = Joi.object({
  //   id: Joi.string().required(),
  //   event: Joi.string()
  //     .regex(
  //       /^(PAYMENT_CREATED|PAYMENT_AWAITING_RISK_ANALYSIS|PAYMENT_APPROVED_BY_RISK_ANALYSIS|PAYMENT_REPROVED_BY_RISK_ANALYSIS|PAYMENT_AUTHORIZED|PAYMENT_UPDATED|PAYMENT_CONFIRMED|PAYMENT_RECEIVED|PAYMENT_CREDIT_CARD_CAPTURE_REFUSED|PAYMENT_ANTICIPATED|PAYMENT_OVERDUE|PAYMENT_DELETED|PAYMENT_RESTORED|PAYMENT_REFUNDED|PAYMENT_REFUND_IN_PROGRESS|PAYMENT_RECEIVED_IN_CASH_UNDONE|PAYMENT_CHARGEBACK_REQUESTED|PAYMENT_CHARGEBACK_DISPUTE|PAYMENT_AWAITING_CHARGEBACK_REVERSAL|PAYMENT_DUNNING_RECEIVED|PAYMENT_DUNNING_REQUESTED|PAYMENT_BANK_SLIP_VIEWED|PAYMENT_CHECKOUT_VIEWED)$/
  //     )
  //     .required(),
  //   AsaasAccessToken: Joi.string().required(),
  //   payment: Joi.object({
  //     object: Joi.string().required(),
  //     externalReference: Joi.string(),
  //     id: Joi.string().required(),
  //     dateCreated: Joi.string().required(),
  //     customer: Joi.string().required(),
  //     value: Joi.number().required(),
  //     netValue: Joi.number().required(),
  //     dueDate: Joi.number().required(),
  //     billingType: Joi.string()
  //       .regex(/^(PIX|CREDIT_CARD|BOLETO)$/)
  //       .required(),
  //     status: Joi.string()
  //       .regex(
  //         /^(PENDING|RECEIVED|CONFIRMED|OVERDUE|REFUNDED|RECEIVED_IN_CASH|REFUND_REQUESTED|REFUND_IN_PROGRESS|CHARGEBACK_REQUESTED|CHARGEBACK_DISPUTE|AWAITING_CHARGEBACK_REVERSAL|DUNNING_REQUESTED|DUNNING_RECEIVED|AWAITING_RISK_ANALYSIS)$/
  //       )
  //       .required(),
  //   }).pattern(Joi.string(), Joi.any()),
  // });

  // const schemaValidation = Joi.object({
  //   ...keySchema.describe().keys,
  // }).pattern(Joi.string(), Joi.any());

  // const validation = schemaValidation.validate(req.body, { abortEarly: false });

  // if (validation.error) {
  //   const errors = validation.error.details.map((detail) => ({
  //     message: detail.message,
  //     path: detail.path,
  //     type: detail.type,
  //   }));
  //   return res.status(400).json({ errors });
  // }

  next();
};
