import { sign, verify } from "jsonwebtoken";

export type Result = {
  id: number;
  hash: string;
  type: "root" | "adm";
};

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
