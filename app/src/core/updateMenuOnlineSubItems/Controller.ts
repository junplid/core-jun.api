import { Request, Response } from "express";
import {
  UpdateMenuOnlineSubItemsStatusBodyDTO_I,
  UpdateMenuOnlineSubItemsStatusParamsDTO_I,
} from "./DTO";
import { UpdateMenuOnlineSubItemsStatusUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateMenuOnlineSubItemsStatusController = (
  useCase: UpdateMenuOnlineSubItemsStatusUseCase,
) => {
  const execute = async (
    req: Request<
      UpdateMenuOnlineSubItemsStatusParamsDTO_I,
      any,
      UpdateMenuOnlineSubItemsStatusBodyDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.params });
      return res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      if (error instanceof ErrorResponse) {
        const { statusCode, ...obj } = error.getResponse();
        return res.status(statusCode).json(obj);
      }
      return res.status(500).json(error);
    }
  };

  return { execute };
};
