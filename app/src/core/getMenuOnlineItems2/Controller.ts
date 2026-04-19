import { Request, Response } from "express";
import {
  GetMenuOnlineItems2BodyDTO_I,
  GetMenuOnlineItems2ParamsDTO_I,
  GetMenuOnlineItems2QueryDTO_I,
} from "./DTO";
import { GetMenuOnlineItems2UseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetMenuOnlineItems2Controller = (
  useCase: GetMenuOnlineItems2UseCase,
) => {
  const execute = async (
    req: Request<
      GetMenuOnlineItems2ParamsDTO_I,
      any,
      GetMenuOnlineItems2BodyDTO_I,
      GetMenuOnlineItems2QueryDTO_I
    >,
    res: Response,
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
