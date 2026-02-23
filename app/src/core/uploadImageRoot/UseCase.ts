import { UploadImageRootDTO_I } from "./DTO";

export class UploadImageRootUseCase {
  constructor() {}

  async run(image: UploadImageRootDTO_I) {
    return { message: "OK!", status: 201, image };
  }
}
