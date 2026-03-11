import { Request, Response } from "express";
import {
  GetMenuOnlineCategoriesForSelectBodyDTO_I,
  GetMenuOnlineCategoriesForSelectParamsDTO_I,
} from "./DTO";
import { GetMenuOnlineCategoriesForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetMenuOnlineCategoriesForSelectController = (
  useCase: GetMenuOnlineCategoriesForSelectUseCase,
) => {
  const execute = async (
    req: Request<
      GetMenuOnlineCategoriesForSelectParamsDTO_I,
      any,
      GetMenuOnlineCategoriesForSelectBodyDTO_I,
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
