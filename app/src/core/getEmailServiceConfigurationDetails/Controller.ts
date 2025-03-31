import { Request, Response } from "express";
import {
  GetEmailServiceConfigurationDetailsParamsDTO_I,
  GetEmailServiceConfigurationDetailsBodyDTO_I,
} from "./DTO";
import { GetEmailServiceConfigurationDetailsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetEmailServiceConfigurationDetailsController = (
  useCase: GetEmailServiceConfigurationDetailsUseCase
) => {
  const execute = async (
    req: Request<
      GetEmailServiceConfigurationDetailsParamsDTO_I,
      any,
      GetEmailServiceConfigurationDetailsBodyDTO_I
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
