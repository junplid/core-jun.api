import { createMetaHttpClient } from "./meta.client";

export async function getMetaAccessToken(code: string): Promise<string> {
  const client = createMetaHttpClient();
  const { data } = await client.get("/oauth/access_token", {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri:
        "https://1255f03ad922.ngrok-free.app/v1/public/meta/auth/instagram/callback",
      code: code,
    },
  });

  return data.access_token;
}

export async function getMetaLongAccessToken(
  access_token: string,
): Promise<string> {
  const client = createMetaHttpClient();
  const { data } = await client.get("/oauth/access_token", {
    params: {
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: access_token,
    },
  });

  return data.access_token;
}
