import { Request, Response } from "express";
import {
  DeleteShootingSpeeBodyDTO_I,
  DeleteShootingSpeeParamsDTO_I,
} from "./DTO";
import { DeleteShootingSpeeUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteShootingSpeeController = (
  useCase: DeleteShootingSpeeUseCase
) => {
  const execute = async (
    req: Request<
      DeleteShootingSpeeParamsDTO_I,
      any,
      DeleteShootingSpeeBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params };
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
