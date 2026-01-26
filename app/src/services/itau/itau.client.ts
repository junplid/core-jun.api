import axios from "axios";

export function createItauHttpClient(environment: "PROD" | "HOMOLOG") {
  return axios.create({
    baseURL:
      environment === "PROD"
        ? "https://secure.api.itau"
        : "https://sandbox.devportal.itau.com.br",
    timeout: 10000,
  });
}
