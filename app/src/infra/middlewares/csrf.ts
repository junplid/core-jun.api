import { NextFunction, Request, Response } from "express";

export function csrfMiddleware(
  req: Request<any, any, any, any>,
  res: Response<any, any>,
  next: NextFunction,
) {
  const cookieToken = req.cookies["XSRF-TOKEN"];
  const headerToken = req.headers["x-xsrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: "CSRF invalid" });
  }

  next();
}
