import { Request, Response } from "express";
import { GetPlanBodyDTO_I, GetPlanParamsDTO_I, GetPlanQueryDTO_I } from "./DTO";
import { GetPlanUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetPlanController = (useCase: GetPlanUseCase) => {
  const execute = async (
    req: Request<GetPlanParamsDTO_I, any, GetPlanBodyDTO_I, GetPlanQueryDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.params,
        ...req.body,
        ...req.query,
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
