import { Request, Response } from "express";
import {
  UpdateMenuOnlineCategoryBodyDTO_I,
  UpdateMenuOnlineCategoryParamsDTO_I,
} from "./DTO";
import { UpdateMenuOnlineCategoryUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateMenuOnlineCategoryController = (
  useCase: UpdateMenuOnlineCategoryUseCase,
) => {
  const execute = async (
    req: Request<
      UpdateMenuOnlineCategoryParamsDTO_I,
      any,
      UpdateMenuOnlineCategoryBodyDTO_I
    >,
    res: Response,
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
