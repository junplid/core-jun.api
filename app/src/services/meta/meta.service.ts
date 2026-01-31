import axios from "axios";

const graph = axios.create({
  baseURL: `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}`,
});

export async function exchangeCodeForToken(code: string) {
  const { data } = await graph.get("/oauth/access_token", {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.META_REDIRECT_URI,
      code,
    },
  });

  return data;
}

export async function getBusinesses(accessToken: string) {
  const { data } = await graph.get("/me/businesses", {
    params: { access_token: accessToken },
  });
  return data;
}

export async function getWabas(accessToken: string) {
  const { data } = await graph.get(`/me/whatsapp_business_accounts`, {
    params: { access_token: accessToken },
  });
  return data;
}
