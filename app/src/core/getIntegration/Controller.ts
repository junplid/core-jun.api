import { Request, Response } from "express";
import { GetIntegrationBodyDTO_I, GetIntegrationParamsDTO_I } from "./DTO";
import { GetIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetIntegrationController = (useCase: GetIntegrationUseCase) => {
  const execute = async (
    req: Request<GetIntegrationParamsDTO_I, any, GetIntegrationBodyDTO_I>,
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
