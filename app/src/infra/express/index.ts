import { config } from "dotenv";
import { readdirSync } from "fs";
import http from "http";
import { resolve } from "path";
import { Server } from "socket.io";
import { prisma } from "../../adapters/Prisma/client";
import { WebSocketIo } from "../websocket";
import { App as app } from "./app";
import { startConnections } from "../../utils/startConnections";
import { startChatbotQueue } from "../../utils/startChatbotQueue";
import { ensureDir } from "fs-extra";

config();

const server = http.createServer(app);
const io =
  process.env.NODE_ENV === "prod"
    ? new Server(server, {
        cors: {
          origin: ["https://app.junplid.com.br", "https://root.junplid.com.br"],
          methods: ["GET", "POST"],
          credentials: true,
        },
      })
    : new Server(server, { cors: { origin: "*" } });

const path = resolve(process.env.STORAGE_PATH!, "bin", "chatbot-queue");

const startServer = async (): Promise<void> => {
  try {
    console.log("DATABASE#2 -", "Conectando...");

    await prisma
      .$connect()
      .then(async () => {
        console.log("DATABASE#2 -", "Conectado com sucesso!");
        try {
          WebSocketIo(io);
          server.listen(process.env.ENV_PORT, () => {
            console.log("Servidor rodando na porta:", process.env.ENV_PORT);
          });
          await startConnections();

          await ensureDir(path);
          const dirPathQueue = readdirSync(path);

          for await (const fileName of dirPathQueue) {
            const chatbotId = Number(fileName.split(".")[0]);
            await startChatbotQueue(chatbotId);
          }
        } catch (error) {
          console.log("Error na iniciação", error);
        }
      })
      .catch((err: any) => {
        console.log(err);
        console.log("ERROR AO CONECTAR COM O PRISMA");
      });
  } catch (error) {
    console.log(error);
  }
};

startServer();

const getSocketIo = () => io;
export { getSocketIo, io as socketIo };
