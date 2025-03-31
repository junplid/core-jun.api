import { Request, Response } from "express";
import { CreateEmailServiceConfigurationDTO_I } from "./DTO";
import { CreateEmailServiceConfigurationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateEmailServiceConfigurationController = (
  useCase: CreateEmailServiceConfigurationUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateEmailServiceConfigurationDTO_I>,
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
