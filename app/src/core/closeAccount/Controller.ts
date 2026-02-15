import { Request, Response } from "express";
import { CloseAccountDTO_I } from "./DTO";
import { CloseAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CloseAccountController = (useCase: CloseAccountUseCase) => {
  const execute = async (
    req: Request<any, any, CloseAccountDTO_I>,
    res: Response,
  ): Promise<Response> => {
    try {
      await useCase.run(req.body);
      const prod = process.env.NODE_ENV === "production";
      res.clearCookie("access_token", {
        domain: prod ? ".junplid.com.br" : undefined,
        path: "/",
      });
      res.clearCookie("XSRF-TOKEN", {
        domain: prod ? ".junplid.com.br" : undefined,
        path: "/",
      });
      return res.sendStatus(204);
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
