import { Request, Response } from "express";
import {
  GetFacebookIntegrationDetailsBodyDTO_I,
  GetFacebookIntegrationDetailsParamsDTO_I,
} from "./DTO";
import { GetFacebookIntegrationDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFacebookIntegrationDetailsController = (
  useCase: GetFacebookIntegrationDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetFacebookIntegrationDetailsParamsDTO_I,
      any,
      GetFacebookIntegrationDetailsBodyDTO_I
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
