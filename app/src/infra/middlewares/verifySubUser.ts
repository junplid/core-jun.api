import { NextFunction, Request, Response } from "express";
import { prisma } from "../../adapters/Prisma/client";

export const VerifySubUserMiddleware = async (
  req: Request<any, any, { subUserUid?: string; accountId: number }, any>,
  res: Response,
  next: NextFunction,
  props: {
    type: "Create" | "Delete" | "Update";
    entity:
      | "business"
      | "campaign"
      | "campaignAudience"
      | "campaignOndemand"
      | "campaignParameters"
      | "chatbot"
      | "connections"
      | "customizationLink"
      | "emailService"
      | "flows"
      | "dataFlow"
      | "sector"
      | "sectorAttendants"
      | "servicesConfig"
      | "supervisors"
      | "tags"
      | "users"
      | "contactWAOnAccount"
      | "uploadFile"
      | "checkpoint"
      | "integration"
      | "variables";
  }
) => {
  if (req.body.subUserUid) {
    const accountExist = await prisma[
      `subAccountPermissions${props.type}`
      // @ts-expect-error
    ].findFirst({
      where: { SubAccount: { uid: req.body.subUserUid, status: true } },
      select: {
        [props.entity]: true,
        SubAccount: { select: { uid: true, accountId: true } },
      },
    });

    if (!accountExist) return next();

    if (accountExist && !accountExist[props.entity]) {
      return res.status(401).json({
        message: "Não authorizado! AQUI",
      });
    }

    console.log({ accountExist });

    req.body.accountId = accountExist.SubAccount.accountId;
    (req.body as any).subUserUid = accountExist.SubAccount.uid;
  }

  return next();
};
