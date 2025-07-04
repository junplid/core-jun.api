import { prisma } from "../../../adapters/Prisma/client";
import { NodeChargeData } from "../Payload";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import moment from "moment-timezone";

interface PropsNodeCharge {
  data: NodeChargeData;
  contactsWAOnAccountId: number;
  nodeId: string;
  accountId: number;
  flowStateId: number;
}

export const NodeCharge = async (
  props: PropsNodeCharge
): Promise<"error" | "success"> => {
  const getIntegration = await prisma.paymentIntegrations.findFirst({
    where: { id: props.data.paymentIntegrationId },
    select: { access_token: true, provider: true },
  });
  if (!getIntegration) {
    console.error("Payment integration not found.");
    return "error";
  }

  let email = "sousa20300@gmail.com";
  const varEmail = await prisma.contactsWAOnAccountVariable.findFirst({
    where: {
      id: props.contactsWAOnAccountId,
      variableId: props.data.varId_email,
    },
    select: { value: true },
  });
  if (varEmail?.value) email = varEmail.value;

  const client = new MercadoPagoConfig({
    accessToken: getIntegration.access_token,
    options: { timeout: 5000 },
  });
  const payment = new Payment(client);
  try {
    const total = await resolveTextVariables({
      accountId: props.accountId,
      text: String(props.data.total),
      contactsWAOnAccountId: props.contactsWAOnAccountId,
    });
    const description = await resolveTextVariables({
      accountId: props.accountId,
      text: props.data.content || "",
      contactsWAOnAccountId: props.contactsWAOnAccountId,
      nodeId: props.nodeId,
    });

    const date_of_expiration = moment()
      .tz("America/Sao_Paulo")
      .add(30, "minutes")
      .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

    const charge = await payment.create({
      body: {
        transaction_amount: Number(total),
        description,
        payment_method_id: props.data.method_type || "pix",
        payer: { email },
        date_of_expiration,
        // notification_url:
        //   "https://junplid.com.br/v1/public/webhook/mercadopago",
        notification_url:
          "https://e25a-2804-3894-961-5600-9184-a58c-cd4e-1896.ngrok-free.app/v1/public/webhook/mercadopago",
      },
    });

    if (charge.id) {
      await prisma.charges.create({
        data: {
          transactionId: String(charge.id),
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
        },
        select: { id: true },
      });
    } else {
      console.error("Charge creation failed, no ID returned.");
      return "error";
    }

    const transactionId = charge.id;
    const qrCodeString = charge.point_of_interaction?.transaction_data?.qr_code;
    const qrLink = charge.point_of_interaction?.transaction_data?.ticket_url;

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
            value: String(transactionId),
          },
        });
      } else {
        await prisma.contactsWAOnAccountVariable.update({
          where: { id: exist.id },
          data: { value: String(transactionId) },
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
  } catch (error) {
    console.error("Error creating charge:", error);
    return "error";
  }

  return "success";
};
