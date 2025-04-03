import { Request, Response } from "express";
import {
  GetBusinessDetailsBodyDTO_I,
  GetBusinessDetailsParamsDTO_I,
} from "./DTO";
import { GetBusinessDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetBusinessDetailsController = (
  useCase: GetBusinessDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetBusinessDetailsParamsDTO_I,
      any,
      GetBusinessDetailsBodyDTO_I
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
