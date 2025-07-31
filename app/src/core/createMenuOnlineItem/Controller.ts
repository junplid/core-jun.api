import { Request, Response } from "express";
import {
  CreateMenuOnlineItemBodyDTO_I,
  CreateMenuOnlineItemDTO_I,
  CreateMenuOnlineItemParamsDTO_I,
} from "./DTO";
import { CreateMenuOnlineItemUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateMenuOnlineItemController = (
  useCase: CreateMenuOnlineItemUseCase
) => {
  const execute = async (
    req: Request<
      CreateMenuOnlineItemParamsDTO_I,
      any,
      CreateMenuOnlineItemBodyDTO_I
    >,
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
