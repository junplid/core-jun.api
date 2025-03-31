import { remove } from "fs-extra";
import { resolve } from "path";
import { CreateImageHumanServiceUserDTO_I } from "./DTO";
import { CreateImageHumanServiceUserRepository_I } from "./Repository";

export class CreateImageHumanServiceUserUseCase {
  constructor(private repository: CreateImageHumanServiceUserRepository_I) {}

  async run({ userId, ...dto }: Required<CreateImageHumanServiceUserDTO_I>) {
    const fetch = await this.repository.fetchExistUser(userId);

    if (!fetch) {
      throw {
        message: "Usuário não encontrado.",
        status: 400,
      };
    }

    if (fetch.oldImage) {
      const path = resolve(
        __dirname,
        "../../../",
        "static",
        "image",
        fetch.oldImage
      );
      await remove(path).catch((error) => {
        console.log("Não foi possivel deletar a imagem antiga", error);
      });
    }

    await this.repository.update({
      userId,
      fileName: dto.name,
      type: fetch.type,
    });

    return {
      message: "OK!",
      status: 201,
      imageName: dto.name,
    };
  }
}
