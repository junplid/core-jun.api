import { Request, Response } from "express";
import {
  GetFieldsConnectionWABodyDTO_I,
  GetFieldsConnectionWAParamsDTO_I,
} from "./DTO";
import { GetFieldsConnectionWAUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFieldsConnectionWAController = (
  useCase: GetFieldsConnectionWAUseCase
) => {
  const execute = async (
    req: Request<
      GetFieldsConnectionWAParamsDTO_I,
      any,
      GetFieldsConnectionWABodyDTO_I
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
