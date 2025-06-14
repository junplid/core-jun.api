import { Request, Response } from "express";
import { DeleteInboxUsersBodyDTO_I, DeleteInboxUsersParamsDTO_I } from "./DTO";
import { DeleteInboxUsersUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteInboxUsersController = (
  useCase: DeleteInboxUsersUseCase
) => {
  const execute = async (
    req: Request<DeleteInboxUsersParamsDTO_I, any, DeleteInboxUsersBodyDTO_I>,
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
