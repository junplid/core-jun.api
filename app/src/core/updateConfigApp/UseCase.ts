import {
  ensureDirSync,
  existsSync,
  readFileSync,
  removeSync,
  writeFileSync,
} from "fs-extra";
import { resolve } from "path";
import { UpdateConfigAppDTO_I } from "./DTO";

export class UpdateConfigAppUseCase {
  constructor() {}

  async run(dto: UpdateConfigAppDTO_I) {
    const pathConfig = resolve(__dirname, "../../config/index.json");
    const pathConfigExist = existsSync(pathConfig);
    if (!pathConfigExist) {
      ensureDirSync(resolve(__dirname, "../../config"));
      writeFileSync(pathConfig, JSON.stringify(dto, null, 2));
    } else {
      const config = readFileSync(pathConfig, { encoding: "utf-8" });
      const configParsed = JSON.parse(config) as UpdateConfigAppDTO_I;
      if (dto.fileName) {
        removeSync(resolve(__dirname, `../../config/${configParsed.fileName}`));
      }
      const newConfig = { ...configParsed, ...dto };
      writeFileSync(pathConfig, JSON.stringify(newConfig, null, 2));
    }

    return {
      message: "OK!",
      status: 200,
      config: { fileName: dto.fileName },
    };
  }
}
