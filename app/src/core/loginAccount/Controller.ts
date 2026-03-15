import { Request, Response } from "express";
import { LoginAccountDTO_I } from "./DTO";
import { LoginAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";
import moment from "moment";
import { randomBytes } from "crypto";

export const LoginAccountController = (useCase: LoginAccountUseCase) => {
  const execute = async (
    req: Request<any, any, LoginAccountDTO_I>,
    res: Response,
  ): Promise<Response> => {
    try {
      const { token, ...data } = await useCase.run(req.body);
      const csrfToken = randomBytes(32).toString("hex");
      const prod = process.env.NODE_ENV === "production";
      const isNgrok = !prod;

      res.cookie("access_token", token, {
        httpOnly: true,
        secure: prod || isNgrok, // ngrok é HTTPS
        sameSite: prod || isNgrok ? "none" : "lax",
        domain: prod ? ".junplid.com.br" : undefined,
        path: "/",
        expires: moment().add(1, "year").toDate(),
      });

      res.cookie("XSRF-TOKEN", csrfToken, {
        secure: prod || isNgrok,
        sameSite: prod || isNgrok ? "none" : "lax",
        domain: prod ? ".junplid.com.br" : undefined,
        path: "/",
        expires: moment().add(1, "year").toDate(),
      });
      return res.status(200).json({ ...data, csrfToken });
    } catch (error) {
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
