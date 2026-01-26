import { Request, Response } from "express";
// import { prisma } from "../../adapters/Prisma/client";
// import { createItauHttpClient } from "./itau.client";

export async function itauPixWebhook(req: Request, res: Response) {
  const eventos = req.body.pix;

  for (const evento of eventos) {
    const txid = evento.txid;
    const e2eId = evento.endToEndId;

    console.log(evento);

    // await prisma.charges.update({
    //   where: { txid: txid },
    //   data: {
    //     paid_at: new Date(evento.horario),
    //     e2e_id: e2eId,
    //     status: "approved",
    //   },
    // });
  }

  res.status(200).send();
}

export async function setupPixWebhook(token: string, pixKey: string) {
  // const client = createItauHttpClient();
  // await client.put(
  //   `/pix/v2/webhook/${pixKey}`,
  //   { webhookUrl: "https://api.junplid.com/v1/public/itau" },
  //   { headers: { Authorization: `Bearer ${token}` } },
  // );
}
