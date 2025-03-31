import { Request, Response } from "express";
import { GetAccountUserDTO_I } from "./DTO";
import { GetAccountUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetAccountUserController = (useCase: GetAccountUserUseCase) => {
  const execute = async (
    req: Request<any, any, GetAccountUserDTO_I>,
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
