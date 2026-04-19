import { Request, Response } from "express";
import { CreateTableItemBodyDTO_I, CreateTableItemParamsDTO_I } from "./DTO";
import { CreateTableItemUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateTableItemController = (useCase: CreateTableItemUseCase) => {
  const execute = async (
    req: Request<CreateTableItemParamsDTO_I, any, CreateTableItemBodyDTO_I>,
    res: Response,
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
