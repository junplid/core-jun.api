import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetPixelsFacebookIntegrationForSelectDTO_I } from "./DTO";
import { Business, FacebookAdsApi } from "facebook-nodejs-business-sdk";

export class GetPixelsFacebookIntegrationForSelectUseCase {
  constructor() {}

  async run(dto: GetPixelsFacebookIntegrationForSelectDTO_I) {
    try {
      const facebookIntegration = await prisma.facebookIntegration.findUnique({
        where: { id: dto.id, accountId: dto.accountId },
        select: { access_token: true },
      });

      if (!facebookIntegration?.access_token) {
        throw new ErrorResponse(400)
          .toast({
            title: `Integração facebook não foi encontrada!`,
            type: "error",
          })
          .input({
            path: "id",
            text: "Integração facebook inválida",
          });
      }

      const api = FacebookAdsApi.init(facebookIntegration.access_token);
      const business = new Business(
        dto.fbBusinessId,
        undefined,
        undefined,
        api
      );
      const pixels = await business.getAdsPixels(["name", "id"]);

      return {
        message: "OK!",
        status: 200,
        fbPixels: pixels.map((s) => ({ id: s.id, name: s.name })),
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar buscar Integração facebook!`,
        type: "error",
      });
    }
  }
}
