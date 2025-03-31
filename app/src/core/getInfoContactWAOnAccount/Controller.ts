import { Request, Response } from "express";
import {
  GetContactWAOnAccountParamsDTO_I,
  GetContactWAOnAccountBodyDTO_I,
} from "./DTO";
import { GetContactWAOnAccountUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetContactWAOnAccountController = (
  useCase: GetContactWAOnAccountUseCase
) => {
  const execute = async (
    req: Request<
      GetContactWAOnAccountParamsDTO_I,
      any,
      GetContactWAOnAccountBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params });
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
