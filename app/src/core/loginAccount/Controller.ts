import { Request, Response } from "express";
import { LoginAccountDTO_I } from "./DTO";
import { LoginAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const LoginAccountController = (useCase: LoginAccountUseCase) => {
  const execute = async (
    req: Request<any, any, LoginAccountDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
      return res.status(200).json(data);
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
