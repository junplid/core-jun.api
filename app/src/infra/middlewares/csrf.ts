import { NextFunction, Request, Response } from "express";

export function csrfMiddleware(
  req: Request<any, any, any, any>,
  res: Response<any, any>,
  next: NextFunction,
) {
  const cookieTokens = [
    req.cookies["APP_XSRF_TOKEN"] || "",
    req.cookies["MENU_XSRF_TOKEN"] || "",
    req.cookies["ROOT_XSRF_TOKEN"] || "",
  ];
  const headerToken = req.headers["x-xsrf-token"];

  if (
    !cookieTokens?.length ||
    !headerToken ||
    !cookieTokens.includes(headerToken)
  ) {
    return res.status(403).json({ a: false });
  }

  next();
}
