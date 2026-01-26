import { createPixCharge, generatePixTxid, getPixQrCode } from "./itau.pix";
import moment from "moment-timezone";

interface ICharge {
  total: number;
  id: number;
}

export async function generatePixForCharge(
  token: string,
  charge: ICharge,
  pixKey: string,
) {
  const txid = generatePixTxid(charge.id);
  console.log("AQUI 1");
  // await createPixCharge(token, {
  //   txid,
  //   expiracao: 3600, // segundos = 1h
  //   valor: charge.total.toFixed(2),
  //   chavePix: pixKey,
  //   solicitacaoPagador: `Charge ${charge.id}`,
  // });
  // console.log("AQUI 2");

  // const qr = await getPixQrCode(token, txid);
  console.log("AQUI 3");

  const currentDate = moment().tz("America/Sao_Paulo").add(4, "hour");

  // return {
  //   txid,
  //   pix_emv: qr.emv, // copia e cola PIX ou gerar qrcode
  //   pix_link: qr.pixLink,
  //   expires_at: currentDate.toDate(),
  //   status: "pending" as "pending",
  // };
}
