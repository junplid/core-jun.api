import { Request, Response } from "express";
import { UpdateMenuOnlineBodyDTO_I, UpdateMenuOnlineParamsDTO_I } from "./DTO";
import { UpdateMenuOnlineUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateMenuOnlineController = (
  useCase: UpdateMenuOnlineUseCase
) => {
  const execute = async (
    req: Request<UpdateMenuOnlineParamsDTO_I, any, UpdateMenuOnlineBodyDTO_I>,
    res: Response
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
