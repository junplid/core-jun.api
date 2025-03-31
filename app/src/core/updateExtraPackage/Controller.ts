import { Request, Response } from "express";
import {
  UpdateExtraPackageBodyDTO_I,
  UpdateExtraPackageParamsDTO_I,
} from "./DTO";
import { UpdateExtraPackageUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateExtraPackageController = (
  useCase: UpdateExtraPackageUseCase
) => {
  const execute = async (
    req: Request<
      UpdateExtraPackageParamsDTO_I,
      any,
      UpdateExtraPackageBodyDTO_I
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
