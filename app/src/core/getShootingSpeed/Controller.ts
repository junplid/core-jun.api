import { Request, Response } from "express";
import { GetShootingSpeedBodyDTO_I, GetShootingSpeedParamsDTO_I } from "./DTO";
import { GetShootingSpeedUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetShootingSpeedController = (
  useCase: GetShootingSpeedUseCase
) => {
  const execute = async (
    req: Request<GetShootingSpeedParamsDTO_I, any, GetShootingSpeedBodyDTO_I>,
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
