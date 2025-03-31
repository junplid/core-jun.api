import { Request, Response } from "express";
import {
  GetBusinessFacebookIntegrationForSelectBodyDTO_I,
  GetBusinessFacebookIntegrationForSelectQueryDTO_I,
  GetBusinessFacebookIntegrationForSelectParamsDTO_I,
} from "./DTO";
import { GetBusinessFacebookIntegrationForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetBusinessFacebookIntegrationForSelectController = (
  useCase: GetBusinessFacebookIntegrationForSelectUseCase
) => {
  const execute = async (
    req: Request<
      GetBusinessFacebookIntegrationForSelectParamsDTO_I,
      any,
      GetBusinessFacebookIntegrationForSelectBodyDTO_I,
      GetBusinessFacebookIntegrationForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
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
