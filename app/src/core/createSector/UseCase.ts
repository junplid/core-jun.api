import { ErrorResponse } from "../../utils/ErrorResponse";
import { CreateSectorDTO_I } from "./DTO";
import { CreateSectorRepository_I } from "./Repository";

export class CreateSectorUseCase {
  constructor(private repository: CreateSectorRepository_I) {}

  async run({ operatingDays, ...dto }: CreateSectorDTO_I) {
    const exist = await this.repository.fetchExist({
      accountId: dto.accountId,
      name: dto.name,
      businessId: dto.businessId,
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já Setor com esse nome`,
      });
    }

    const data = await this.repository.create({
      ...dto,
      operatingDays: operatingDays && operatingDays?.join("-"),
    });

    return {
      message: "Setor criado com sucesso!",
      status: 201,
      sector: data,
    };
  }
}
