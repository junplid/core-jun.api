import { Request, Response } from "express";
import { LoginRootDTO_I } from "./DTO";
import { LoginRootUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const LoginRootController = (useCase: LoginRootUseCase) => {
  const execute = async (
    req: Request<any, any, LoginRootDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
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
