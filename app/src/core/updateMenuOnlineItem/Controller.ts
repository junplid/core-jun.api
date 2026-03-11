import { Request, Response } from "express";
import {
  UpdateMenuOnlineItemBodyDTO_I,
  UpdateMenuOnlineItemParamsDTO_I,
} from "./DTO";
import { UpdateMenuOnlineItemUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateMenuOnlineItemController = (
  useCase: UpdateMenuOnlineItemUseCase,
) => {
  const execute = async (
    req: Request<
      UpdateMenuOnlineItemParamsDTO_I,
      any,
      UpdateMenuOnlineItemBodyDTO_I
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
