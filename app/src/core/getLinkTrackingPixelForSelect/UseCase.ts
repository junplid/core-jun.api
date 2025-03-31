import { GetLinkTrackingPixelForSelectForSelectDTO_I } from "./DTO";
import { GetLinkTrackingPixelForSelectRepository_I } from "./Repository";

export class GetLinkTrackingPixelForSelectUseCase {
  constructor(private repository: GetLinkTrackingPixelForSelectRepository_I) {}

  async run(dto: GetLinkTrackingPixelForSelectForSelectDTO_I) {
    const linkTrackingPixel = await this.repository.fetch(dto);

    return {
      message: "OK!",
      status: 200,
      linkTrackingPixel,
    };
  }
}
