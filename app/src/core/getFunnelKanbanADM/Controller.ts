import { Request, Response } from "express";
import {
  GetFunnelKanbanADMBodyDTO_I,
  GetFunnelKanbanADMParamsDTO_I,
} from "./DTO";
import { GetFunnelKanbanADMUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFunnelKanbanADMController = (
  useCase: GetFunnelKanbanADMUseCase
) => {
  const execute = async (
    req: Request<
      GetFunnelKanbanADMParamsDTO_I,
      any,
      GetFunnelKanbanADMBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.params, ...req.body });
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
