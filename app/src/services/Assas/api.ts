require("dotenv/config");

import axios from "axios";
import JSON from "../../config/root.json";

export const ApiAssas = axios.create({
  baseURL: JSON["endpoint-asaas"],
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    common: {
      access_token: JSON["token-asaas"],
    },
  },
});
