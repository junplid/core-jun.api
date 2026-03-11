import { Request, Response } from "express";
import {
  GetMenuOnlineItemsForSelectBodyDTO_I,
  GetMenuOnlineItemsForSelectParamsDTO_I,
} from "./DTO";
import { GetMenuOnlineItemsForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetMenuOnlineItemsForSelectController = (
  useCase: GetMenuOnlineItemsForSelectUseCase,
) => {
  const execute = async (
    req: Request<
      GetMenuOnlineItemsForSelectParamsDTO_I,
      any,
      GetMenuOnlineItemsForSelectBodyDTO_I,
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
