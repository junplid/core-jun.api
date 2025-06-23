import { Request, Response } from "express";
import {
  UpdateFbPixelBodyDTO_I,
  UpdateFbPixelParamsDTO_I,
  UpdateFbPixelQueryDTO_I,
} from "./DTO";
import { UpdateFbPixelUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateFbPixelController = (useCase: UpdateFbPixelUseCase) => {
  const execute = async (
    req: Request<
      UpdateFbPixelParamsDTO_I,
      any,
      UpdateFbPixelBodyDTO_I,
      UpdateFbPixelQueryDTO_I
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
