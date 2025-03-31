import { Request, Response } from "express";
import {
  UpdatePlanBodyDTO_I,
  UpdatePlanParamsDTO_I,
  UpdatePlanQueryDTO_I,
} from "./DTO";
import { UpdatePlanUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdatePlanController = (useCase: UpdatePlanUseCase) => {
  const execute = async (
    req: Request<
      UpdatePlanParamsDTO_I,
      any,
      UpdatePlanBodyDTO_I,
      UpdatePlanQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
      const data = await useCase.run(dto);
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
