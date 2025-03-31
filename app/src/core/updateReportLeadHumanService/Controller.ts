import { Request, Response } from "express";
import {
  UpdateReportLeadHumanServiceBodyDTO_I,
  UpdateReportLeadHumanServiceParamsDTO_I,
} from "./DTO";
import { UpdateReportLeadHumanServiceUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateReportLeadHumanServiceController = (
  useCase: UpdateReportLeadHumanServiceUseCase
) => {
  const execute = async (
    req: Request<
      UpdateReportLeadHumanServiceParamsDTO_I,
      any,
      UpdateReportLeadHumanServiceBodyDTO_I
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
