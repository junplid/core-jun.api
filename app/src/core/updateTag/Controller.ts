import { Request, Response } from "express";
import {
  UpdateTagBodyDTO_I,
  UpdateTagParamsDTO_I,
  UpdateTagQueryDTO_I,
} from "./DTO";
import { UpdateTagUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateTagController = (useCase: UpdateTagUseCase) => {
  const execute = async (
    req: Request<
      UpdateTagParamsDTO_I,
      any,
      UpdateTagBodyDTO_I,
      UpdateTagQueryDTO_I
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
