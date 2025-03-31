import { Request, Response } from "express";
import {
  GetLinkTrackingPixelForSelectBodyDTO_I,
  GetLinkTrackingPixelForSelectQueryDTO_I,
} from "./DTO";
import { GetLinkTrackingPixelForSelectUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const GetLinkTrackingPixelForSelectController = (
  useCase: GetLinkTrackingPixelForSelectUseCase
) => {
  const execute = async (
    req: Request<
      any,
      any,
      GetLinkTrackingPixelForSelectBodyDTO_I,
      GetLinkTrackingPixelForSelectQueryDTO_I
    >,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run({ ...req.body, ...req.query });
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
