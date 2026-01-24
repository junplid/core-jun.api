import { AxiosInstance } from "axios";

export async function getItauAccessToken(
  client: AxiosInstance,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const response = await client.post(
    "/oauth/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  return response.data.access_token;
}
