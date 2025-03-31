import { Request, Response } from "express";
import { UpdateSectorBodyDTO_I, UpdateSectorParamsDTO_I } from "./DTO";
import { UpdateSectorUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateSectorController = (useCase: UpdateSectorUseCase) => {
  const execute = async (
    req: Request<UpdateSectorParamsDTO_I, any, UpdateSectorBodyDTO_I>,
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
