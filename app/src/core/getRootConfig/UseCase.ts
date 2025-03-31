import { readFile } from "fs-extra";
import { GetRootConfigDTO_I } from "./DTO";
import { resolve } from "path";

interface RootJSON {
  "token-asaas": string;
  "endpoint-asaas": string;
}

export class GetRootConfigUseCase {
  constructor() {}

  async run(dto: GetRootConfigDTO_I) {
    const rootJSON: RootJSON = JSON.parse(
      (await readFile(resolve(__dirname, "../../config/root.json"))).toString()
    );

    return {
      message: "OK!",
      status: 200,
      rootJSON,
    };
  }
}
