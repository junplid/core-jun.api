import { AxiosInstance } from "axios";
// import { createItauHttpClient } from "./itau.client";

// const environment = "";

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
  const { data } = await client.post(
    `/pix_recebimentos_conciliacoes/v2/cobrancas_imediata_pix`,
    {
      calendario: { expiracao: payload.expiracao },
      valor: { original: "123.45" },
      chave: payload.chavePix,
      // solicitacaoPagador: payload.solicitacaoPagador,
      txid: payload.txid,
    },
    {
      headers: {
        // Authorization: token,
        // "x-sandbox-token": token,
        "x-itau-apikey": token,
        //
      },
    },
  );
  console.log(data);
}

export async function getPixQrCode(
  client: AxiosInstance,
  token: string,
  txid: string,
) {
  const response = await client.get(
    `/itau-ep9-gtw-pix-recebimentos-conciliacoes-v2-ext/v2/cobrancas_imediata_pix/${txid}/qrcode`,
    { headers: { "x-sandbox-token": token } },
  );

  return {
    emv: response.data.emv,
    pixLink: response.data.pix_link,
    imagemBase64: response.data.imagem_base64,
  };
}

export interface PixKeyInfo {
  key: string;
  keyType: string;
  accountHolder: {
    name: string;
    taxId: string;
  };
  status: "ACTIVE" | "INACTIVE";
}

export async function testPixKey(
  client: AxiosInstance,
  token: string,
  pixKey: string,
): Promise<PixKeyInfo> {
  const response = await client.get(
    `/pix/v2/keys/${encodeURIComponent(pixKey)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (response.data.status !== "ACTIVE") {
    throw new Error("Chave Pix existe, mas não está ativa");
  }

  return response.data;
}
