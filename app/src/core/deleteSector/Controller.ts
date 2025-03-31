import { Request, Response } from "express";
import { DeleteSectorBodyDTO_I, DeleteSectorParamsDTO_I } from "./DTO";
import { DeleteSectorUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const DeleteSectorController = (useCase: DeleteSectorUseCase) => {
  const execute = async (
    req: Request<DeleteSectorParamsDTO_I, any, DeleteSectorBodyDTO_I>,
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
