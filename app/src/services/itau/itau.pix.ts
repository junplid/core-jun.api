import { AxiosInstance } from "axios";

export function generatePixTxid(id: number): string {
  const timestamp = Date.now().toString(36);
  return `ch-${id}${timestamp}`.slice(0, 35);
}

export async function createPixCharge(
  client: AxiosInstance,
  token: string,
  payload: {
    txid: string;
    expiracao: number;
    valor: string;
    chavePix: string;
    solicitacaoPagador: string;
  },
): Promise<void> {
  await client.put(
    `/pix_recebimentos_conciliacoes/v2/cobrancas_imediata_pix/${payload.txid}`,
    {
      calendario: { expiracao: payload.expiracao },
      valor: { original: payload.valor },
      chave: payload.chavePix,
      solicitacaoPagador: payload.solicitacaoPagador,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export async function getPixQrCode(
  client: AxiosInstance,
  token: string,
  txid: string,
) {
  const response = await client.get(
    `/pix_recebimentos_conciliacoes/v2/cobrancas_imediata_pix/${txid}/qrcode`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return {
    emv: response.data.emv,
    pixLink: response.data.pix_link,
    imagemBase64: response.data.imagem_base64,
  };
}
