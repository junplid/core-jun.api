import { Request, Response } from "express";
import {
  GetGeolocationForSelectBodyDTO_I,
  GetGeolocationForSelectQueryDTO_I,
} from "./DTO";
import { GetGeolocationForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetGeolocationForSelectController = (
  useCase: GetGeolocationForSelectUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetGeolocationForSelectBodyDTO_I,
      GetGeolocationForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
      });
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
