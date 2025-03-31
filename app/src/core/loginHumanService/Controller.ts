import { Request, Response } from "express";
import { LoginHumanServiceDTO_I } from "./DTO";
import { LoginHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const LoginHumanServiceController = (
  useCase: LoginHumanServiceUseCase
) => {
  const execute = async (
    req: Request<any, any, LoginHumanServiceDTO_I>,
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
