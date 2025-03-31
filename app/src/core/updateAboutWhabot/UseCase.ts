import { writeFile } from "fs-extra";
import { resolve } from "path";
import { UpdateHelpSessionDTO_I } from "./DTO";

export class UpdateHelpSessionUseCase {
  constructor() {}

  async run({ text, page }: UpdateHelpSessionDTO_I) {
    const pathFile = resolve(__dirname, `../../../static/text/${page}.txt`);
    await writeFile(pathFile, text, { encoding: "utf-8" });

    return { message: "OK!", status: 200 };
  }
}
