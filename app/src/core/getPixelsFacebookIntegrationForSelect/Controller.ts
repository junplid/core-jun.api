import { Request, Response } from "express";
import {
  GetPixelsFacebookIntegrationForSelectBodyDTO_I,
  GetPixelsFacebookIntegrationForSelectParamsDTO_I,
} from "./DTO";
import { GetPixelsFacebookIntegrationForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetPixelsFacebookIntegrationForSelectController = (
  useCase: GetPixelsFacebookIntegrationForSelectUseCase
) => {
  const execute = async (
    req: Request<
      GetPixelsFacebookIntegrationForSelectParamsDTO_I,
      any,
      GetPixelsFacebookIntegrationForSelectBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
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
