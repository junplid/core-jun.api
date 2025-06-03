import { Request, Response } from "express";
import {
  UpdateShootingSpeedBodyDTO_I,
  UpdateShootingSpeedBodyQueryDTO_I,
  UpdateShootingSpeedParamsDTO_I,
} from "./DTO";
import { UpdateShootingSpeedUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateShootingSpeedController = (
  useCase: UpdateShootingSpeedUseCase
) => {
  const execute = async (
    req: Request<
      UpdateShootingSpeedParamsDTO_I,
      any,
      UpdateShootingSpeedBodyDTO_I,
      UpdateShootingSpeedBodyQueryDTO_I
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
