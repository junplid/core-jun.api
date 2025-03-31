import { Request, Response } from "express";
import {
  GetSubAccountDetailsBodyDTO_I,
  GetSubAccountDetailsParamsDTO_I,
} from "./DTO";
import { GetSubAccountDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetSubAccountDetailsController = (
  useCase: GetSubAccountDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetSubAccountDetailsParamsDTO_I,
      any,
      GetSubAccountDetailsBodyDTO_I
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
