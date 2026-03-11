import { Request, Response } from "express";
import {
  UpdateMenuOnlineStatusBodyDTO_I,
  UpdateMenuOnlineStatusParamsDTO_I,
} from "./DTO";
import { UpdateMenuOnlineStatusUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateMenuOnlineStatusController = (
  useCase: UpdateMenuOnlineStatusUseCase,
) => {
  const execute = async (
    req: Request<
      UpdateMenuOnlineStatusParamsDTO_I,
      any,
      UpdateMenuOnlineStatusBodyDTO_I
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
