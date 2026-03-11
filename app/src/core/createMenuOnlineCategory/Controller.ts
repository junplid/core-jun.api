import { Request, Response } from "express";
import {
  CreateMenuOnlineCategoryBodyDTO_I,
  CreateMenuOnlineCategoryParamsDTO_I,
} from "./DTO";
import { CreateMenuOnlineCategoryUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateMenuOnlineCategoryController = (
  useCase: CreateMenuOnlineCategoryUseCase,
) => {
  const execute = async (
    req: Request<
      CreateMenuOnlineCategoryParamsDTO_I,
      any,
      CreateMenuOnlineCategoryBodyDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.params,
        image45x45png: req.file!.filename,
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
