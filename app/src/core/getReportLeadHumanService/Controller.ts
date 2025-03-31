import { Request, Response } from "express";
import {
  GetReportLeadHumanServiceBodyDTO_I,
  GetReportLeadHumanServiceParamsDTO_I,
  GetReportLeadHumanServiceQueryDTO_I,
} from "./DTO";
import { GetReportLeadHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetReportLeadHumanServiceController = (
  useCase: GetReportLeadHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      GetReportLeadHumanServiceParamsDTO_I,
      any,
      GetReportLeadHumanServiceBodyDTO_I,
      GetReportLeadHumanServiceQueryDTO_I
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
