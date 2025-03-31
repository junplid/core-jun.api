import { Request, Response } from "express";
import { CreateFacebookIntegrationDTO_I } from "./DTO";
import { CreateFacebookIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateFacebookIntegrationController = (
  useCase: CreateFacebookIntegrationUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateFacebookIntegrationDTO_I>,
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
