import { Request, Response } from "express";
import { LoginRootDTO_I } from "./DTO";
import { LoginRootUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";
import moment from "moment";
import { randomBytes } from "crypto";

export const LoginRootController = (useCase: LoginRootUseCase) => {
  const execute = async (
    req: Request<any, any, LoginRootDTO_I>,
    res: Response,
  ): Promise<Response> => {
    try {
      const { token, ...data } = await useCase.run(req.body);
      const csrfToken = randomBytes(32).toString("hex");
      const prod = process.env.NODE_ENV === "production";
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: prod,
        sameSite: prod ? "none" : "lax",
        domain: prod ? "api.junplid.com.br" : undefined,
        path: "/",
        expires: moment().add(1, "year").toDate(),
      });
      res.cookie("XSRF-TOKEN", csrfToken, {
        secure: prod,
        sameSite: prod ? "none" : "lax",
        domain: prod ? ".junplid.com.br" : undefined,
        path: "/",
        expires: moment().add(1, "year").toDate(),
      });
      return res.status(200).json(data);
    } catch (error: any) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
