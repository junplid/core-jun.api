import { sign, verify } from "jsonwebtoken";

export type Result =
  | {
      id: number;
      hash: string;
      type: "root" | "adm" | "attendant" | "supervisor";
    }
  | {
      uid: string;
      type: "subUser";
    }
  | {
      id: number;
      type: "api";
      flowStateId: number;
      linkTrackingPixelId: number;
      campaignId?: number;
      flowId: number;
      contactsWAOnAccountId: number;
      connectionWhatsId: number;
    }
  | { id: number; type: "api-ondemand" }
  | { id: number; accountId: number; hash: string; type: "api-export" };

export const createTokenAuth = async (
  data: Result,
  secret: string
): Promise<string> => {
  return sign(data, secret);
};

export const decodeTokenAuth = async (
  token: string,
  secret: string
): Promise<Result> => {
  try {
    const data: any = verify(token, secret);
    return data;
  } catch (error) {
    throw new Error("Não autorizado.");
  }
};
