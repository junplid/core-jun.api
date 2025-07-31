import { Request, Response } from "express";
import {
  GetMenuOnlineItemsBodyDTO_I,
  GetMenuOnlineItemsParamsDTO_I,
  GetMenuOnlineItemsQueryDTO_I,
} from "./DTO";
import { GetMenuOnlineItemsUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetMenuOnlineItemsController = (
  useCase: GetMenuOnlineItemsUseCase
) => {
  const execute = async (
    req: Request<
      GetMenuOnlineItemsParamsDTO_I,
      any,
      GetMenuOnlineItemsBodyDTO_I,
      GetMenuOnlineItemsQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
        ...req.query,
        ...req.params,
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
