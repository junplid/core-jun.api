import { Request, Response } from "express";
import {
  UpdateInboxUserBodyDTO_I,
  UpdateInboxUserParamsDTO_I,
  UpdateInboxUserQueryDTO_I,
} from "./DTO";
import { UpdateInboxUserUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateInboxUserController = (useCase: UpdateInboxUserUseCase) => {
  const execute = async (
    req: Request<
      UpdateInboxUserParamsDTO_I,
      any,
      UpdateInboxUserBodyDTO_I,
      UpdateInboxUserQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const dto = { ...req.body, ...req.params, ...req.query };
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
