import { remove } from "fs-extra";
import { resolve } from "path";
import { sessionsBaileysWA } from "../../adapters/Baileys";
import { CreateImageConnectionUserDTO_I } from "./DTO";
import { CreateImageConnectionUserRepository_I } from "./Repository";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class CreateImageConnectionUserUseCase {
  constructor(private repository: CreateImageConnectionUserRepository_I) {}

  async run(dto: CreateImageConnectionUserDTO_I) {
    try {
      const fetch = await this.repository.fetchExist(dto.id);
      if (!fetch) {
        throw new ErrorResponse(400).toast({
          title: `Conexão não foi encontrada`,
          type: "error",
        });
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
      await this.repository.update(dto);
      const bot = sessionsBaileysWA.get(dto.id);

      let number = bot?.user?.id.split(":")[0];
      if (number && bot) {
        const path = resolve(
          __dirname,
          `../../../static/image/${dto.fileName}`
        );

        try {
          await bot.updateProfilePicture(`${number}@s.whatsapp.net`, {
            url: path,
          });
        } catch (error) {
          throw new ErrorResponse(400).toast({
            title: `Não foi possivel atualizar a imagem de perfil`,
            type: "error",
          });
        }
      }

      return { message: "OK!", status: 201, imageName: dto.fileName };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error para atualizar a imagem de perfil`,
        type: "error",
      });
    }
  }
}
