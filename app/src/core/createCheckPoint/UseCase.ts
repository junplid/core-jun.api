import { CreateCheckPointRepository_I } from "./Repository";
import { CreateCheckPointDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateCheckPointUseCase {
  constructor(private repository: CreateCheckPointRepository_I) {}

  async run(dto: CreateCheckPointDTO_I) {
    const isAlreadyExists = await this.repository.fetchAlreadyExists(dto);

    if (isAlreadyExists) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: "Já existe com esse nome",
      });
    }

    const data = await this.repository.create(dto);

    return {
      message: "Plano assinado com sucesso!",
      status: 201,
      checkpoint: data,
    };
  }
}
