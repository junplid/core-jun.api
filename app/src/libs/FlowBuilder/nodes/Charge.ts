import { prisma } from "../../../adapters/Prisma/client";
import { NodeChargeData } from "../Payload";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import moment from "moment-timezone";
import { parseDirtyStringToNumber } from "../../../utils/parseDirtyStringToNumber";
import { decrypte } from "../../encryption";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";

type PropsNodeCharge =
  | {
      data: NodeChargeData;
      contactsWAOnAccountId: number;
      nodeId: string;
      accountId: number;
      flowStateId: number;
      actions?: {
        onDataCharge(props: {
          code: string;
          qrcode: string;
          link: string;
        }): void;
      };
      mode: "prod";
    }
  | {
      mode: "testing";
      accountId: number;
      token_modal_chat_template: string;
    };

export const NodeCharge = async (
  props: PropsNodeCharge,
): Promise<"error" | "success"> => {
  if (props.mode === "testing") {
    await SendMessageText({
      token_modal_chat_template: props.token_modal_chat_template,
      role: "system",
      accountId: props.accountId,
      text: "Tentou criar de cobrança PIX, mas só funciona apenas em chat real",
      mode: "testing",
    });

    return "success";
  }
  const getIntegration = await prisma.paymentIntegrations.findFirst({
    where: { id: props.data.paymentIntegrationId, deleted: false },
    select: {
      credentials: true,
      provider: true,
      pixKeys: { select: { key: true, id: true } },
    },
  });
  if (!getIntegration) {
    console.error("Payment integration not found.");
    return "error";
  }

  const total = parseDirtyStringToNumber(
    await resolveTextVariables({
      accountId: props.accountId,
      text: String(props.data.total),
      contactsWAOnAccountId: props.contactsWAOnAccountId,
    }),
  );

  let transactionId: string = "";
  let qrLink: string = "";
  let qrCodeString: string = "";
  if (getIntegration.provider === "mercadopago") {
    let email = "no-reply@junplid.com.br";
    if (props.data.varId_email) {
      const varEmail = await prisma.contactsWAOnAccountVariable.findFirst({
        where: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varId_email,
        },
        select: { value: true },
      });
      if (varEmail?.value) email = varEmail.value;
    }

    try {
      const decrypt = decrypte(getIntegration.credentials);

      const client = new MercadoPagoConfig({
        accessToken: decrypt.access_token,
        options: { timeout: 5000 },
      });
      const payment = new Payment(client);
      const description = await resolveTextVariables({
        accountId: props.accountId,
        text: props.data.content || "",
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        nodeId: props.nodeId,
      });

      const date_of_expiration = moment().add(30, "minutes").toISOString();

      const charge = await payment.create({
        body: {
          transaction_amount: total,
          description,
          payment_method_id: props.data.method_type || "pix",
          payer: { email },
          date_of_expiration,
          notification_url:
            "https://15f4051f5cb6.ngrok-free.app/v1/public/webhook/mercadopago",
        },
      });

      if (charge.id) {
        console.log(charge.id);
        transactionId = String(charge.id);
        await prisma.charges.create({
          data: {
            txid: transactionId,
            total: props.data.total,
            net_total: charge.net_amount || props.data.total,
            currency: props.data.currency || "BRL",
            status: "pending",
            method_type: props.data.method_type || "pix",
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            accountId: props.accountId,
            businessId: props.data.businessId,
            flowNodeId: props.nodeId,
            provider: getIntegration.provider,
            content: props.data.content,
            paymentIntegrationId: props.data.paymentIntegrationId,
            flowStateId: props.flowStateId,
            pix_link: charge.point_of_interaction?.transaction_data?.ticket_url,
            pix_emv: charge.point_of_interaction?.transaction_data?.qr_code,
          },
          select: { id: true },
        });
      } else {
        console.error("Charge creation failed.");
        return "error";
      }

      if (charge.point_of_interaction?.transaction_data?.qr_code) {
        qrCodeString = charge.point_of_interaction?.transaction_data?.qr_code;
      }
      if (charge.point_of_interaction?.transaction_data?.ticket_url) {
        qrLink = charge.point_of_interaction?.transaction_data?.ticket_url;
      }
    } catch (error) {
      console.error("Error creating charge:", error);
      return "error";
    }
  } else {
    // const charge = await prisma.charges.create({
    //   data: {
    //     total,
    //     net_total: total,
    //     currency: props.data.currency || "BRL",
    //     status: "created",
    //     method_type: props.data.method_type || "pix",
    //     contactsWAOnAccountId: props.contactsWAOnAccountId,
    //     accountId: props.accountId,
    //     businessId: props.data.businessId,
    //     flowNodeId: props.nodeId,
    //     provider: getIntegration.provider,
    //     content: props.data.content,
    //     paymentIntegrationId: props.data.paymentIntegrationId,
    //     flowStateId: props.flowStateId,
    //     pixKeyId: getIntegration.pixKeys[0].id,
    //   },
    //   select: { id: true },
    // });
    try {
      // const decrypt = decrypte(getIntegration.credentials);
      // const token = await getItauAccessToken(
      //   decrypt.clientId,
      //   decrypt.clientSecret,
      // );
      // const result = await generatePixForCharge(
      //   token,
      //   { total, id: charge.id },
      //   decrypt.pixKeys[0].key,
      // );
      // await prisma.charges.update({ where: { id: charge.id }, data: result });
      // transactionId = result.txid;
      // qrLink = result.pix_link;
      // qrCodeString = result.pix_emv;
    } catch (error) {
      console.log("falha ao tentar decriptografar `credentials`.");
      return "error";
    }
  }

  props.actions?.onDataCharge({
    code: transactionId,
    qrcode: qrCodeString,
    link: qrLink,
  });

  if (props.data.varId_save_transactionId) {
    const exist = await prisma.contactsWAOnAccountVariable.findFirst({
      where: {
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        variableId: props.data.varId_save_transactionId,
      },
      select: { id: true },
    });
    if (!exist) {
      await prisma.contactsWAOnAccountVariable.create({
        data: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varId_save_transactionId,
          value: transactionId,
        },
      });
    } else {
      await prisma.contactsWAOnAccountVariable.update({
        where: { id: exist.id },
        data: { value: transactionId },
      });
    }
  }
  if (props.data.varId_save_qrCode && qrCodeString) {
    const exist = await prisma.contactsWAOnAccountVariable.findFirst({
      where: {
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        variableId: props.data.varId_save_qrCode,
      },
      select: { id: true },
    });
    if (!exist) {
      await prisma.contactsWAOnAccountVariable.create({
        data: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varId_save_qrCode,
          value: qrCodeString,
        },
      });
    } else {
      await prisma.contactsWAOnAccountVariable.update({
        where: { id: exist.id },
        data: { value: qrCodeString },
      });
    }
  }
  if (props.data.varId_save_linkPayment && qrLink) {
    const exist = await prisma.contactsWAOnAccountVariable.findFirst({
      where: {
        contactsWAOnAccountId: props.contactsWAOnAccountId,
        variableId: props.data.varId_save_linkPayment,
      },
      select: { id: true },
    });
    if (!exist) {
      await prisma.contactsWAOnAccountVariable.create({
        data: {
          contactsWAOnAccountId: props.contactsWAOnAccountId,
          variableId: props.data.varId_save_linkPayment,
          value: qrLink,
        },
      });
    } else {
      await prisma.contactsWAOnAccountVariable.update({
        where: { id: exist.id },
        data: { value: qrLink },
      });
    }
  }

  return "success";
};
