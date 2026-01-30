import { NextFunction, Request, Response } from "express";
import { prisma } from "../../adapters/Prisma/client";
import { Result, decodeTokenAuth } from "../../helpers/authToken";

export const MiddlewareAuth =
  (expected: Array<"root" | "adm">) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Não autenticado 1" });
    }

    let payload: Result;
    try {
      payload = await decodeTokenAuth(token, process.env.SECRET_TOKEN_AUTH!);
    } catch {
      return res.status(401).json({ message: "Token inválido" });
    }

    if (!expected.includes(payload.type)) {
      return res.status(403).json({ message: "Sem permissão" });
    }

    if (payload.type === "adm") {
      const account = await prisma.account.findFirst({
        where: { id: payload.id, hash: payload.hash },
      });

      if (!account) {
        return res.status(401).json({ message: "Sessão inválida" });
      }
    }

    if (payload.type === "root") {
      const root = await prisma.rootUsers.findFirst({
        where: { id: payload.id, hash: payload.hash },
      });

      if (!root) {
        return res.status(401).json({ message: "Sessão inválida" });
      }
    }

    req.user = { id: payload.id, role: payload.type };

    return next();
  };
