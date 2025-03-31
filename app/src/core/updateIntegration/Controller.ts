import { Request, Response } from "express";
import {
  UpdateIntegrationBodyDTO_I,
  UpdateIntegrationParamsDTO_I,
  UpdateIntegrationQueryDTO_I,
} from "./DTO";
import { UpdateIntegrationUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateIntegrationController = (
  useCase: UpdateIntegrationUseCase
) => {
  const execute = async (
    req: Request<
      UpdateIntegrationParamsDTO_I,
      any,
      UpdateIntegrationBodyDTO_I,
      UpdateIntegrationQueryDTO_I
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
