import { NextFunction, Request, Response } from "express";
import { prisma } from "../../adapters/Prisma/client";
import { Result, decodeTokenAuth } from "../../helpers/authToken";

type expected = "root" | "adm";

interface PropsMiddleware_I {
  expected: expected[];
  express: {
    req: Request<any, any, any, any>;
    res: Response<any>;
    next: NextFunction;
  };
}

const keyBody = {
  root: "rootId",
  adm: "accountId",
  // subUser: "accountId",
  // attendant: "userId",
  // supervisor: "userId",
  // api: "userId",
};

export const MiddlewareAuth = async ({
  expected,
  express,
}: PropsMiddleware_I) => {
  const { next, req, res } = express;
  const findToken =
    req.headers.authorization?.toString().split(" ")[1] ||
    req.query.token?.toString().split(" ")[1];

  if (!findToken) {
    return res.status(401).json({ message: "Não autorizado! 33" });
  }

  const token = structuredClone(findToken);
  if (req.query?.token) {
    const { token, ...restQuery } = req.query;
    req.headers.authorization = token;
    req.query = restQuery;
  }

  let tokenDecoded: Result | null = null;
  try {
    tokenDecoded = await decodeTokenAuth(token, "secret123");
  } catch (error) {
    return res.status(401).json({ message: "Não autorizado! 40" });
  }

  if (!tokenDecoded) {
    return res.status(401).json({ message: "Não autorizado! 44" });
  }

  if (!expected.includes(tokenDecoded.type as expected)) {
    console.log(expected, tokenDecoded.type);
    return res.status(401).json({ message: "Não autorizado! 48" });
  }

  if (tokenDecoded.type === "root") {
  }
  if (tokenDecoded.type === "adm") {
    const accountExist = await prisma.account.count({
      where: { id: tokenDecoded.id, hash: tokenDecoded.hash },
    });

    if (!accountExist) {
      return res.status(401).json({
        message: "Não authorizado! 60",
      });
    }
  }

  // if (tokenDecoded.type === "subUser") {
  //   const accountExist = await prisma.subAccount.findFirst({
  //     where: { uid: tokenDecoded.uid, status: true },
  //     select: { accountId: true },
  //   });

  //   if (!accountExist) {
  //     return res.status(401).json({
  //       message: "Não authorizado! 75",
  //     });
  //   }

  //   if (req.headers["content-type"]?.includes("multipart/form-data")) {
  //     req.headers.authorization = accountExist.accountId.toString();
  //     req.body.subUserUid = tokenDecoded.uid;
  //   } else {
  //     req.body.accountId = accountExist.accountId;
  //     req.body.subUserUid = tokenDecoded.uid;
  //   }
  //   return next();
  // }
  // if (tokenDecoded.type === "attendant") {
  //   const sectorsAttendantsAlreadyExist = await prisma.sectorsAttendants.count({
  //     where: { id: tokenDecoded.id, hash: tokenDecoded.hash },
  //   });

  //   if (!sectorsAttendantsAlreadyExist) {
  //     return res.status(401).json({
  //       message: "Não authorizado! 96",
  //     });
  //   }
  // }

  // if (tokenDecoded.type === "supervisor") {
  //   const supervisorsAlreadyExist = await prisma.supervisors.count({
  //     where: { id: tokenDecoded.id, hash: tokenDecoded.hash },
  //   });

  //   if (!supervisorsAlreadyExist) {
  //     return res.status(401).json({
  //       message: "Não authorizado!108",
  //     });
  //   }
  // }

  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    req.headers.authorization = String(tokenDecoded.id);
  } else {
    req.body[keyBody[tokenDecoded.type]] = tokenDecoded.id;
  }

  return next();
};
