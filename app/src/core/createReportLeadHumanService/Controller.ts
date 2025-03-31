import { Request, Response } from "express";
import { CreateReportLeadHumanServiceDTO_I } from "./DTO";
import { CreateReportLeadHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateReportLeadHumanServiceController = (
  useCase: CreateReportLeadHumanServiceUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateReportLeadHumanServiceDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      console.log("CONTROLER");
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
