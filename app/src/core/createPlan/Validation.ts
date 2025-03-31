import { Decimal } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { Joi } from "express-validation";
import { ErrorResponse } from "../../interfaces/ErrorResponse";
import { CreatePlanDTO_I } from "./DTO";

export const createPlanValidation = (
  req: Request<any, any, CreatePlanDTO_I>,
  res: Response,
  next: NextFunction
) => {
  const { type, PlanPeriods } = req.body;

  const schemaValidation = Joi.object({
    rootId: Joi.number().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    isDefault: Joi.boolean().optional(),
    type: Joi.string()
      .regex(/^(free|paid)$/)
      .required(),
    acceptsNewUsers: Joi.boolean().required(),
    activeFoSubscribers: Joi.boolean().required(),
    allowsRenewal: Joi.boolean().required(),
    free_trial_time: Joi.number().min(0).optional(),
    label: Joi.string(),
    PlanPeriods: Joi.array()
      .items(
        Joi.object({
          label: Joi.string(),
          cycle: Joi.string()
            .regex(
              /^(WEEKLY|BIWEEKLY|MONTHLY|BIMONTHLY|QUARTERLY|SEMIANNUALLY|YEARLY)$/
            )
            .required(),
          price_after_renovation: Joi.number().optional(),
          price: Joi.number().required(),
        })
      )
      .optional(),
    PlanAssets: Joi.object({
      business: Joi.number(),
      connections: Joi.number(),
      storageSize: Joi.number(),
      users: Joi.number(),
      attendants: Joi.number(),
      flow: Joi.number(),
      marketingSends: Joi.number(),
      chatbots: Joi.number(),
      contactsWA: Joi.number(),
      nodeInitial: Joi.boolean(),
      nodeMessage: Joi.boolean(),
      nodeReply: Joi.boolean(),
      nodeSwitch: Joi.boolean(),
      nodeSendContactData: Joi.boolean(),
      nodeSendVideo: Joi.boolean(),
      nodeSendPdf: Joi.boolean(),
      nodeSendFile: Joi.boolean(),
      nodeSendImage: Joi.boolean(),
      nodeSendAudio: Joi.boolean(),
      nodeSendLink: Joi.boolean(),
      nodeMathematicalOperators: Joi.boolean(),
      nodeCheckPoint: Joi.boolean(),
      nodeInterruption: Joi.boolean(),
      nodeAction: Joi.boolean(),
      nodeEmailSending: Joi.boolean(),
      nodeLinkTackingPixel: Joi.boolean(),
      nodeSendLocationGPS: Joi.boolean(),
      nodeLogicalConditionData: Joi.boolean(),
      nodeDistributeFlow: Joi.boolean(),
      nodeNotifyNumber: Joi.boolean(),
      nodeSendHumanService: Joi.boolean(),
      nodeInterruptionLinkTackingPixel: Joi.boolean(),
      nodeTime: Joi.boolean(),
      nodeWebhook: Joi.boolean(),
      nodeInsertLeaderInAudience: Joi.boolean(),
      nodeWebform: Joi.boolean(),
      nodeNewCardTrello: Joi.boolean(),
      nodeMenu: Joi.boolean(),
    }).required(),
  }).required();

  const validation = schemaValidation.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((detail) => ({
      message: detail.message,
      path: detail.path,
      type: detail.type,
    }));
    return res.status(400).json({ errors });
  }

  if (type === "paid" && !PlanPeriods?.length) {
    const err: ErrorResponse = {
      statusCode: 400,
      message: "Plano pago precisa ter periodos",
      detail: [
        {
          message: "Plano pago precisa ter periodos",
          path: ["type"],
          type: "type",
        },
      ],
    };
    return res.status(400).json(err);
  }

  if (type === "free") {
    req.body.PlanPeriods = undefined;
    req.body.free_trial_time = Number(req.body.free_trial_time);
  }

  if (type === "paid") {
    req.body.PlanPeriods = PlanPeriods?.map((planPeriod) => ({
      ...planPeriod,
      price: new Decimal(planPeriod.price),
      // price_after_renovation: new Decimal(planPeriod.price_after_renovation),
    }));
    req.body.free_trial_time = Number(req.body.free_trial_time);
  }

  next();
};
