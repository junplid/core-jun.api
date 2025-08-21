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

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}

const server = http.createServer(app);
const io =
  process.env.NODE_ENV === "production"
    ? new Server(server)
    : new Server(server, { cors: { origin: "*" } });

const startServer = async (): Promise<void> => {
  try {
    console.log("DATABASE#2 -", "Conectando...");

    await prisma
      .$connect()
      .then(async () => {
        console.log("DATABASE#2 -", "Conectado com sucesso!");
        try {
          WebSocketIo(io);
          server.listen(process.env.PORT, () => {
            console.log("Servidor rodando na porta:", process.env.PORT);
          });
          await startConnections();

          let path = "";
          if (process.env?.NODE_ENV === "production") {
            path = resolve(__dirname, `../bin/chatbot-queue`);
          } else {
            path = resolve(__dirname, `../../../bin/chatbot-queue`);
          }
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
      .catch((err) => {
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
