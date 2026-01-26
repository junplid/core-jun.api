// import { AxiosInstance } from "axios";
// import { createItauHttpClient } from "./itau.client";

export async function getItauAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  // const client = createItauHttpClient();
  // const response = await client.post(
  //   "/oauth/token",
  //   new URLSearchParams({
  //     grant_type: "client_credentials",
  //     client_id: clientId,
  //     client_secret: clientSecret,
  //   }),
  //   { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  // );

  // return response.data.access_token;
  return "";
}
