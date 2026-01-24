import { createItauHttpClient } from "./itau.client";
import { getItauAccessToken } from "./itau.auth";
import { createPixCharge, generatePixTxid, getPixQrCode } from "./itau.pix";
import { prisma } from "../../adapters/Prisma/client";
import moment from "moment";

interface ICharge {
  total: number;
  id: number;
}

interface ICharge {
  clientId: string;
  clientSecret: string;
  pixKey: string;
}

export async function generatePixForCharge(
  charge: ICharge,
  itauCreds: ICharge,
) {
  const txid = generatePixTxid(charge.id);
  const environment =
    process.env.NODE_ENV === "production" ? "PROD" : "HOMOLOG";
  const client = createItauHttpClient({ ...itauCreds, environment });

  const token = await getItauAccessToken(
    client,
    itauCreds.clientId,
    itauCreds.clientSecret,
  );

  await createPixCharge(client, token, {
    txid,
    expiracao: 3600, // segundos = 1h
    valor: charge.total.toFixed(2),
    chavePix: itauCreds.pixKey,
    solicitacaoPagador: `Charge ${charge.id}`,
  });

  const qr = await getPixQrCode(client, token, txid);

  const currentDate = moment().tz("America/Sao_Paulo").add(4, "hour");

  return {
    txid,
    pix_emv: qr.emv, // copia e cola PIX ou gerar qrcode
    pix_link: qr.pixLink,
    expires_at: currentDate.toDate(),
    status: "pending",
  };
}
