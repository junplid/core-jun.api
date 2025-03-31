import { Request, Response } from "express";
import {
  GetIntegrationDetailsBodyDTO_I,
  GetIntegrationDetailsParamsDTO_I,
} from "./DTO";
import { GetIntegrationDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetIntegrationDetailsController = (
  useCase: GetIntegrationDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetIntegrationDetailsParamsDTO_I,
      any,
      GetIntegrationDetailsBodyDTO_I
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
