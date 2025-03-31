import { GetStaticFileDTO_I } from "./DTO";
import { GetStaticFileRepository_I } from "./Repository";
import { format } from "bytes";

export class GetStaticFileUseCase {
  constructor(private repository: GetStaticFileRepository_I) {}

  async run(dto: GetStaticFileDTO_I) {
    const statics = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      statics: statics.map((a) => ({
        nameFile: a.name,
        name: a.originalName,
        id: a.id,
        type: a.type,
        size: format(a.size),
      })),
    };
  }
}
