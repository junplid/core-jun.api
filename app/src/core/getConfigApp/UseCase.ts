import { existsSync, readFileSync } from "fs-extra";
import { resolve } from "path";
import { GetConfigAppDTO_I } from "./DTO";

export class GetConfigAppUseCase {
  constructor() {}

  async run() {
    const pathConfig = resolve(__dirname, "../../config/index.json");
    const pathConfigExist = existsSync(pathConfig);
    if (!pathConfigExist) {
      return {
        message: "OK!",
        status: 200,
        config: null,
      };
    }

    const config = readFileSync(pathConfig, { encoding: "utf-8" });
    const configParsed = JSON.parse(config) as GetConfigAppDTO_I;

    return {
      message: "OK!",
      status: 200,
      config: configParsed,
    };
  }
}
