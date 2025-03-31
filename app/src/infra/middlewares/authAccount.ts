import { NextFunction, Request, Response } from "express";
import { prisma } from "../../adapters/Prisma/client";
import { decodeTokenAuth, Result } from "../../helpers/authToken";

interface PropsMiddleware_I {
  express: {
    req: Request<any, any, any, any>;
    res: Response<any>;
    next: NextFunction;
  };
}

export const MiddlewareAuthAccount = async ({
  express: { next, req, res },
}: PropsMiddleware_I) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    return res.status(401).json({ message: "Não autorizado!" });
  }

  let tokenDecoded: Result | null = null;
  try {
    tokenDecoded = await decodeTokenAuth(token, "secret123");
  } catch (error) {
    return res.status(401).json({ message: "Não autorizado! 40" });
  }

  if (!tokenDecoded) {
    return res.status(401).json({ message: "Não autorizado! 36" });
  }

  if (tokenDecoded.type === "api") {
    const accountExist = await prisma.account.count({
      where: { id: Number(tokenDecoded.id) },
    });

    if (!accountExist) {
      console.log("AQUI 2");
      return res.status(401).json({
        message: "Não authorizado!",
      });
    }

    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      req.headers.authorization = String(tokenDecoded.id);
    } else {
      // @ts-expect-error
      const { id, type, iat, ...rest } = tokenDecoded;
      const { token, ...params } = req.params;
      req.body = {
        ...req.body,
        ...params,
        accountId: Number(tokenDecoded.id),
        ...rest,
      };
    }
    return next();
  }

  if (tokenDecoded.type === "api-ondemand") {
    console.log(Number());
    const accountExist = await prisma.account.count({
      where: { id: Number(tokenDecoded.id) },
    });

    if (!accountExist) {
      console.log("AQUI 3");
      return res.status(401).json({
        message: "Não authorizado!",
      });
    }

    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      req.headers.authorization = String(tokenDecoded.id);
    } else {
      // @ts-expect-error
      const { type, id, iat, ...rest } = tokenDecoded;
      req.body = { ...req.body, accountId: Number(tokenDecoded.id), ...rest };
    }
    return next();
  }

  if (tokenDecoded.type === "api-export") {
    const accountExist = await prisma.account.count({
      where: { id: Number(tokenDecoded.accountId), hash: tokenDecoded.hash },
    });

    if (!accountExist) {
      return res.status(401).json({ message: "Não autorizado!" });
    }

    // @ts-expect-error
    const { type, iat, hash, ...rest } = tokenDecoded;

    req.body = {
      ...req.body,
      ...rest,
      accountId: Number(tokenDecoded.accountId),
    };

    return next();
  }

  return res.status(401).json({ message: "Não autorizado!" });
};
