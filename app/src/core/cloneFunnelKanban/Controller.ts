import { Request, Response } from "express";
import {
  CreateCloneFunnelKanbanWaBodyDTO_I,
  CreateCloneFunnelKanbanWaParamsDTO_I,
} from "./DTO";
import { CreateCloneFunnelKanbanWaUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateCloneFunnelKanbanWaController = (
  useCase: CreateCloneFunnelKanbanWaUseCase
) => {
  const execute = async (
    req: Request<
      CreateCloneFunnelKanbanWaParamsDTO_I,
      any,
      CreateCloneFunnelKanbanWaBodyDTO_I
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
