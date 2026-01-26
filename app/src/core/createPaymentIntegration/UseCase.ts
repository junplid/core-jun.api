import { CreatePaymentIntegrationDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { getItauAccessToken } from "../../services/itau/itau.auth";
import { setupPixWebhook } from "../../services/itau/itau.pix.webhook";
import { encrypt } from "../../libs/encryption";
import { MercadoPagoConfig, User } from "mercadopago";
import { testPixKey } from "../../services/itau/itau.pix";

export class CreatePaymentIntegrationUseCase {
  constructor() {}

  async run({ accountId, ...dto }: CreatePaymentIntegrationDTO_I) {
    // const isPremium = await prisma.account.findFirst({
    //   where: { id: accountId, isPremium: true },
    // });
    // if (!isPremium) {
    //   throw new ErrorResponse(400).input({
    //     path: "name",
    //     text: "Integrações de pagamento — exclusivos para usuários Premium.",
    //   });
    // }

    const exist = await prisma.paymentIntegrations.findFirst({
      where: { accountId, name: dto.name, provider: dto.provider },
      select: { id: true },
    });

    if (exist) {
      throw new ErrorResponse(400).input({
        path: "name",
        text: `Já existe uma integração com esse nome para: ${dto.provider}`,
      });
    }

    try {
      let credentials: string | null = null;
      let c: boolean = false;
      if (dto.provider === "itau") {
        // const pixKey = await prisma.pixKey.findFirst({
        //   where: { key: dto.pixKey },
        //   select: { webhookRegisteredAt: true },
        // });
        // const token = await getItauAccessToken(
        //   dto.clientId!,
        //   dto.clientSecret!,
        // );

        // if (!pixKey?.webhookRegisteredAt) {
        //   await testPixKey(token, dto.pixKey!);
        //   await setupPixWebhook(token, dto.pixKey!);
        //   c = true;
        // }

        // credentials = encrypt({
        //   clientId: dto.clientId,
        //   clientSecret: dto.clientSecret,
        // });
        throw new ErrorResponse(500).container(
          "Erro ao tentar criar integração de pagamento.",
        );
      } else {
        const client = new MercadoPagoConfig({
          accessToken: dto.access_token!,
          options: { timeout: 5000 },
        });
        const user = new User(client);
        await user.get();
        credentials = encrypt({
          access_token: dto.access_token,
          webhook_secret: dto.webhook_secret,
        });
      }

      const integration = await prisma.paymentIntegrations.create({
        data: {
          credentials,
          accountId,
          name: dto.name,
          provider: dto.provider,
        },
        select: { id: true, createAt: true },
      });
      if (c) {
        await prisma.pixKey.create({
          data: {
            key: dto.pixKey!,
            paymentIntegrationId: integration.id,
            webhookRegisteredAt: new Date(),
          },
        });
      }

      return { status: 201, integration, provider: dto.provider };
    } catch (error) {
      console.error("Erro ao criar integração pagamento.", error);
      throw new ErrorResponse(500).container(
        "Erro ao tentar criar integração de pagamento.",
      );
    }
  }
}
