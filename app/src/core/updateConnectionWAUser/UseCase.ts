import { sessionsBaileysWA } from "../../adapters/Baileys";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { UpdateConnectionWAUserDTO_I } from "./DTO";
import { UpdateConnectionWAUserRepository_I } from "./Repository";

export class UpdateConnectionWAUserUseCase {
  constructor(private repository: UpdateConnectionWAUserRepository_I) {}

  async run({ accountId, id, ...dto }: UpdateConnectionWAUserDTO_I) {
    const exist = await this.repository.fetchExist({
      accountId,
      id,
    });

    if (!exist) {
      throw new ErrorResponse(400).toast({
        title: `Conexão não foi encontrada`,
        type: "error",
      });
    }

    const bot = sessionsBaileysWA.get(id);
    if (bot && !exist.number && bot.user?.id) {
      await this.repository.updateNumber(id, bot.user.id.split(":")[0]);
    }
    if (bot) {
      if (dto.profileName) await bot.updateProfileName(dto.profileName);
      if (dto.profileStatus) await bot.updateProfileStatus(dto.profileStatus);
      if (dto.lastSeenPrivacy)
        await bot.updateLastSeenPrivacy(dto.lastSeenPrivacy);
      if (dto.onlinePrivacy) await bot.updateOnlinePrivacy(dto.onlinePrivacy);
      if (dto.readReceiptsPrivacy)
        await bot.updateReadReceiptsPrivacy(dto.readReceiptsPrivacy);
      if (dto.groupsAddPrivacy)
        await bot.updateGroupsAddPrivacy(dto.groupsAddPrivacy);
      if (dto.statusPrivacy) await bot.updateStatusPrivacy(dto.statusPrivacy);
      if (dto.imgPerfilPrivacy)
        await bot.updateProfilePicturePrivacy(dto.imgPerfilPrivacy);
    }

    await this.repository.update({ accountId: accountId, id: id }, dto);

    return {
      message: "OK!",
      status: 200,
    };
  }
}
