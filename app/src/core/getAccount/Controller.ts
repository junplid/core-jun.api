import { Request, Response } from "express";
import { GetAccountDTO_I } from "./DTO";
import { GetAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { randomBytes } from "crypto";
import moment from "moment";

export const GetAccountController = (useCase: GetAccountUseCase) => {
  const execute = async (
    req: Request<any, any, GetAccountDTO_I>,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
      const csrfToken = randomBytes(32).toString("hex");
      const prod = process.env.NODE_ENV === "production";
      const isNgrok = !prod;

      res.cookie("APP_XSRF_TOKEN", csrfToken, {
        httpOnly: true,
        secure: prod || isNgrok,
        sameSite: prod || isNgrok ? "none" : "lax",
        domain: prod ? ".junplid.com.br" : undefined,
        path: "/",
        expires: moment().add(1, "year").toDate(),
      });

      return res.status(200).json({ ...data, csrfToken });
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
