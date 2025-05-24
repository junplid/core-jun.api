import { UpdateConnectionWADTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { resolve } from "path";
import { remove } from "fs-extra";
import { cacheConnectionsWAOnline } from "../../adapters/Baileys/Cache";
import { sessionsBaileysWA } from "../../adapters/Baileys";

export class UpdateConnectionWAUseCase {
  constructor() {}

  async run({ accountId, id, ...dto }: UpdateConnectionWADTO_I) {
    const exist = await prisma.connectionWA.findFirst({
      where: {
        id,
        Business: { accountId },
        type: dto.type,
      },
      select: { number: true },
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Conexão WA não encontrada`,
        type: "error",
      });
    }

    try {
      const { name, businessId, type, description, fileNameImage, ...config } =
        dto;

      const { Business, ConnectionConfig } = await prisma.connectionWA.update({
        where: {
          id,
          Business: { accountId },
        },
        data: { name, businessId, type, description },
        select: {
          Business: { select: { name: true, id: true } },
          ConnectionConfig: { select: { fileNameImgPerfil: true } },
        },
      });

      if (fileNameImage) {
        if (ConnectionConfig?.fileNameImgPerfil) {
          const path = resolve(
            __dirname,
            "../../../",
            "static",
            "image",
            ConnectionConfig?.fileNameImgPerfil
          );
          await remove(path).catch((error) => {
            console.log("Não foi possivel deletar a imagem antiga", error);
          });
        }
      }

      const hasConfig = !!(Object.keys(config).length || fileNameImage);

      if (hasConfig) {
        await prisma.connectionConfig.update({
          where: {
            connectionWAId: id,
            ConnectionWA: { Business: { accountId } },
          },
          data: { ...config, fileNameImgPerfil: fileNameImage },
        });

        const bot = sessionsBaileysWA.get(id);
        if (bot && !exist.number && bot.user?.id) {
          await prisma.connectionWA.update({
            where: { id, Business: { accountId } },
            data: { number: bot.user.id.split(":")[0] },
          });
        }

        if (bot) {
          await new Promise<void>(async (res, rej) => {
            const run = async (): Promise<void> => {
              try {
                const botIsReset = cacheConnectionsWAOnline.get(id);
                const bot = sessionsBaileysWA.get(id);

                if (!!botIsReset) {
                  await new Promise((r) => setTimeout(r, 4000));
                  return run();
                } else {
                  if (dto.profileName)
                    await bot!.updateProfileName(dto.profileName);
                  if (dto.profileStatus)
                    await bot!.updateProfileStatus(dto.profileStatus);
                  if (dto.lastSeenPrivacy)
                    await bot!.updateLastSeenPrivacy(dto.lastSeenPrivacy);
                  if (dto.onlinePrivacy)
                    await bot!.updateOnlinePrivacy(dto.onlinePrivacy);
                  if (dto.readReceiptsPrivacy)
                    await bot!.updateReadReceiptsPrivacy(
                      dto.readReceiptsPrivacy
                    );
                  if (dto.groupsAddPrivacy)
                    await bot!.updateGroupsAddPrivacy(dto.groupsAddPrivacy);
                  if (dto.statusPrivacy)
                    await bot!.updateStatusPrivacy(dto.statusPrivacy);
                  if (dto.imgPerfilPrivacy)
                    await bot!.updateProfilePicturePrivacy(
                      dto.imgPerfilPrivacy
                    );
                  res();
                }
              } catch (error) {
                const botIsReset = cacheConnectionsWAOnline.get(id);
                if (!!botIsReset) {
                  await new Promise((r) => setTimeout(r, 4000));
                  return run();
                }
                res();
              }
            };

            await run();
          });
        }
      }

      return {
        message: "OK!",
        status: 200,
        connectionWA: { business: Business, fileImage: fileNameImage },
      };
    } catch (error) {
      console.log(error);
      if (dto.fileNameImage) {
        const path = resolve(
          __dirname,
          "../../../",
          "static",
          "image",
          dto.fileNameImage
        );
        await remove(path).catch((error) => {
          console.log("Não foi possivel deletar a imagem antiga", error);
        });
      }
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar atualizar conexão WA`,
        type: "error",
      });
    }
  }
}
