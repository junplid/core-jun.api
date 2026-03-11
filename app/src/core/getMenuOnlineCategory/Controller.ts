import { Request, Response } from "express";
import {
  GetMenuOnlineCategoriesBodyDTO_I,
  GetMenuOnlineCategoriesParamsDTO_I,
} from "./DTO";
import { GetMenuOnlineCategoriesUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetMenuOnlineCategoriesController = (
  useCase: GetMenuOnlineCategoriesUseCase,
) => {
  const execute = async (
    req: Request<
      GetMenuOnlineCategoriesParamsDTO_I,
      any,
      GetMenuOnlineCategoriesBodyDTO_I,
      any
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
