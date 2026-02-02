import axios from "axios";

export function createMetaHttpClient() {
  return axios.create({
    baseURL: "https://graph.facebook.com/v19.0",
    timeout: 10000,
  });
}
