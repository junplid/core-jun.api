import { Request, Response } from "express";
import {
  GetFacebookIntegrationBodyDTO_I,
  GetFacebookIntegrationParamsDTO_I,
} from "./DTO";
import { GetFacebookIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFacebookIntegrationController = (
  useCase: GetFacebookIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      GetFacebookIntegrationParamsDTO_I,
      any,
      GetFacebookIntegrationBodyDTO_I
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
