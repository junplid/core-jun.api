import { Request, Response } from "express";
import { CreateLinkTackingPixelEventDTO_I } from "./DTO";
import { CreateLinkTackingPixelEventUseCase } from "./UseCase";
import { ErrorResponse } from "../../utils/ErrorResponse";

export const CreateLinkTackingPixelEventController = (
  useCase: CreateLinkTackingPixelEventUseCase
) => {
  const execute = async (
    req: Request<any, any, CreateLinkTackingPixelEventDTO_I>,
    res: Response
  ): Promise<Response> => {
    try {
      const data = await useCase.run(req.body);
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
