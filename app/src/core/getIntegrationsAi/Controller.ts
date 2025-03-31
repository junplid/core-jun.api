import { Request, Response } from "express";
import { GetIntegrationsAiDTO_I } from "./DTO";
import { GetIntegrationsAiUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetIntegrationsAiController = (
  useCase: GetIntegrationsAiUseCase
) => {
  const execute = async (
    req: Request<GetIntegrationsAiDTO_I>,
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
