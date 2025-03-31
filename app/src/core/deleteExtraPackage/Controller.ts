import { Request, Response } from "express";
import {
  DeleteExtraPackageBodyDTO_I,
  DeleteExtraPackageParamsDTO_I,
} from "./DTO";
import { DeleteExtraPackageUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteExtraPackageController = (
  useCase: DeleteExtraPackageUseCase
) => {
  const execute = async (
    req: Request<
      DeleteExtraPackageParamsDTO_I,
      any,
      DeleteExtraPackageBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.params, ...req.body });
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
