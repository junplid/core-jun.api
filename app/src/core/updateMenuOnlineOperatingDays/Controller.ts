import { Request, Response } from "express";
import {
  UpdateMenuOnlineOperatingDaysBodyDTO_I,
  UpdateMenuOnlineOperatingDaysParamsDTO_I,
} from "./DTO";
import { UpdateMenuOnlineOperatingDaysUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateMenuOnlineOperatingDaysController = (
  useCase: UpdateMenuOnlineOperatingDaysUseCase,
) => {
  const execute = async (
    req: Request<
      UpdateMenuOnlineOperatingDaysParamsDTO_I,
      any,
      UpdateMenuOnlineOperatingDaysBodyDTO_I
    >,
    res: Response,
  ): Promise<Response> => {
    try {
      const data = await useCase.run({
        ...req.body,
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
