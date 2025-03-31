import { Request, Response } from "express";
import {
  UpdateLinkTackingPixelBodyDTO_I,
  UpdateLinkTackingPixelParamsDTO_I,
  UpdateLinkTackingPixelQueryDTO_I,
} from "./DTO";
import { UpdateLinkTackingPixelUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const UpdateLinkTackingPixelController = (
  useCase: UpdateLinkTackingPixelUseCase
) => {
  const execute = async (
    req: Request<
      UpdateLinkTackingPixelParamsDTO_I,
      any,
      UpdateLinkTackingPixelBodyDTO_I,
      UpdateLinkTackingPixelQueryDTO_I
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
