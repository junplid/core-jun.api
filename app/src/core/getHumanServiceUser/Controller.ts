import { Request, Response } from "express";
import { GetHumanServiceUserDTO_I } from "./DTO";
import { GetHumanServiceUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetHumanServiceUserController = (
  useCase: GetHumanServiceUserUseCase
) => {
  const execute = async (
    req: Request<any, any, GetHumanServiceUserDTO_I>,
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
