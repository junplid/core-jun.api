import axios from "axios";
import { ItauCredentials } from "./itau.types";

export function createItauHttpClient(creds: ItauCredentials) {
  return axios.create({
    baseURL:
      creds.environment === "PROD"
        ? "https://secure.api.itau"
        : "https://secure.api.itau/hml",
    timeout: 10000,
  });
}
