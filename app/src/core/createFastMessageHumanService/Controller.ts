import { Request, Response } from "express";
import { CreateFastMessageHumanServiceDTO_I } from "./DTO";
import { CreateFastMessageHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateFastMessageHumanServiceController = (
  useCase: CreateFastMessageHumanServiceUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateFastMessageHumanServiceDTO_I>,
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
