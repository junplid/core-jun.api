import { Request, Response } from "express";
import {
  DeleteMenuOnlineItemBodyDTO_I,
  DeleteMenuOnlineItemParamsDTO_I,
} from "./DTO";
import { DeleteMenuOnlineItemUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteMenuOnlineItemController = (
  useCase: DeleteMenuOnlineItemUseCase
) => {
  const execute = async (
    req: Request<
      DeleteMenuOnlineItemParamsDTO_I,
      any,
      DeleteMenuOnlineItemBodyDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params };
      const data = await useCase.run(dto);
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
