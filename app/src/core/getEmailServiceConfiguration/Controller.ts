import { Request, Response } from "express";
import {
  GetEmailServiceConfigurationParamsDTO_I,
  GetEmailServiceConfigurationBodyDTO_I,
} from "./DTO";
import { GetEmailServiceConfigurationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetEmailServiceConfigurationController = (
  useCase: GetEmailServiceConfigurationUseCase
) => {
  const execute = async (
    req: Request<
      GetEmailServiceConfigurationParamsDTO_I,
      any,
      GetEmailServiceConfigurationBodyDTO_I
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
