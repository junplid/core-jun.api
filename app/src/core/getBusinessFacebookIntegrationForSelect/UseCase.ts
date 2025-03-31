import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GetBusinessFacebookIntegrationForSelectDTO_I } from "./DTO";
import { User, FacebookAdsApi, Business } from "facebook-nodejs-business-sdk";

export class GetBusinessFacebookIntegrationForSelectUseCase {
  constructor() {}

  async run(dto: GetBusinessFacebookIntegrationForSelectDTO_I) {
    try {
      const facebookIntegration = await prisma.facebookIntegration.findUnique({
        where: { id: dto.id, accountId: dto.accountId },
        select: { access_token: true },
      });

      if (!facebookIntegration?.access_token) {
        throw new ErrorResponse(400)
          .toast({ title: `Integração facebook não encontrada!` })
          .input({
            path: "access_token",
            text: "Integração facebook inválida",
          });
      }

      const api = FacebookAdsApi.init(facebookIntegration.access_token);
      const user = new User("me", undefined, undefined, api);

      const business = await user.getBusinesses(["name", "id"]);

      return {
        message: "OK!",
        status: 200,
        fbBusinesses: business.map((s) => ({ id: s.id, name: s.name })),
      };
    } catch (error) {
      throw new ErrorResponse(400).toast({
        title: `Error ao tentar buscar ou você não esta autorizado!`,
        type: "error",
      });
    }
  }
}
