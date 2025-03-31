import { Request, Response } from "express";
import {
  GetConnectionWAUserBodyDTO_I,
  GetConnectionWAUserParamsDTO_I,
} from "./DTO";
import { GetConnectionWAUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetConnectionWAUserController = (
  useCase: GetConnectionWAUserUseCase
) => {
  const execute = async (
    req: Request<
      GetConnectionWAUserParamsDTO_I,
      any,
      GetConnectionWAUserBodyDTO_I
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
