import { Request, Response } from "express";
import { GetInboxUserBodyDTO_I, GetInboxUserParamsDTO_I } from "./DTO";
import { GetInboxUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetInboxUserController = (useCase: GetInboxUserUseCase) => {
  const execute = async (
    req: Request<GetInboxUserParamsDTO_I, any, GetInboxUserBodyDTO_I>,
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
