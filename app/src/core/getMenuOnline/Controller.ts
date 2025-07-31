import { Request, Response } from "express";
import { GetMenuOnlineBodyDTO_I, GetMenuOnlineParamsDTO_I } from "./DTO";
import { GetMenuOnlineUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetMenuOnlineController = (useCase: GetMenuOnlineUseCase) => {
  const execute = async (
    req: Request<GetMenuOnlineParamsDTO_I, any, GetMenuOnlineBodyDTO_I>,
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
