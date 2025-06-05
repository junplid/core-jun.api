import { Request, Response } from "express";
import {
  UpdateStorageFileBodyDTO_I,
  UpdateStorageFileParamsDTO_I,
  UpdateStorageFileQueryDTO_I,
} from "./DTO";
import { UpdateStorageFileUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateStorageFileController = (
  useCase: UpdateStorageFileUseCase
) => {
  const execute = async (
    req: Request<
      UpdateStorageFileParamsDTO_I,
      any,
      UpdateStorageFileBodyDTO_I,
      UpdateStorageFileQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
        ...req.query,
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
