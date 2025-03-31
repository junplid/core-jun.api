import { Request, Response } from "express";
import { GetExtraPackageBodyDTO_I, GetExtraPackageParamsDTO_I } from "./DTO";
import { GetExtraPackageUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetExtraPackageController = (useCase: GetExtraPackageUseCase) => {
  const execute = async (
    req: Request<GetExtraPackageParamsDTO_I, any, GetExtraPackageBodyDTO_I>,
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
