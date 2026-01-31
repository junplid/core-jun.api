// src/controllers/whatsapp.controller.ts
import { Request, Response } from "express";
import { exchangeCodeForToken, getBusinesses, getWabas } from "./meta.service";

export async function whatsappOAuthCallback(req: Request, res: Response) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Code não informado" });
    }

    // 1️⃣ troca code por token
    console.log("1");
    const tokenData = await exchangeCodeForToken(code as string);
    console.log("2");
    const wabas = await getWabas(tokenData.access_token);

    // 2️⃣ busca WABAs
    // const businesses = await getBusinesses(tokenData.access_token);
    // console.log("3", businesses);

    // const wabas_list = await Promise.all(
    //   businesses.data.map(async (business: any) => {
    //     try {
    //       console.log(business);
    //       return wabas;
    //     } catch (error) {
    //       return;
    //     }
    //   }),
    // );
    console.log("4");

    return res.json({
      success: true,
      token: tokenData,
      wabas,
    });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Erro no OAuth" });
  }
}

export async function listWabaAccounts(req: Request, res: Response) {
  console.log(req);
  // depois: pegar token do banco
  return res.json({ ok: true });
}
