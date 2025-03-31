import { Request, Response } from "express";
import { GetFunnelKanbanBodyDTO_I, GetFunnelKanbanParamsDTO_I } from "./DTO";
import { GetFunnelKanbanUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetFunnelKanbanController = (useCase: GetFunnelKanbanUseCase) => {
  const execute = async (
    req: Request<GetFunnelKanbanParamsDTO_I, any, GetFunnelKanbanBodyDTO_I>,
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
