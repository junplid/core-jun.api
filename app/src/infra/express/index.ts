import { config } from "dotenv";
import "../../adapters/mongo/connection";
import { readdirSync } from "fs";
import { ensureDir, pathExistsSync, writeFile } from "fs-extra";
import http from "http";
import { resolve } from "path";
import { Server } from "socket.io";
import { prisma } from "../../adapters/Prisma/client";
// import { startChatbotQueue } from "../../bin/startChatbotQueue";
import { WebSocketIo } from "../websocket";
import { App as app } from "./app";
import chalk from "chalk";
import { startConnections } from "../../bin/startConnections";

config();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const startServer = async (): Promise<void> => {
  try {
    if (!pathExistsSync(resolve(__dirname, "../../config/root.json"))) {
      await writeFile(
        resolve(__dirname, "../../config/root.json"),
        `{"token-asaas": "", "endpoint-asaas": ""}`
      );
    }

    if (!pathExistsSync(resolve(__dirname, "../../bin/connections.json"))) {
      await writeFile(resolve(__dirname, "../../bin/connections.json"), `[]`);
    }

    // const rPath = "../../..";
    // await ensureDir(resolve(__dirname, rPath + "/static/audio"));
    // await ensureDir(resolve(__dirname, rPath + "/static/file"));
    // await ensureDir(resolve(__dirname, rPath + "/static/image"));
    // await ensureDir(resolve(__dirname, rPath + "/static/pdf"));
    // await ensureDir(resolve(__dirname, rPath + "/static/video"));
    // await ensureDir(
    //   resolve(__dirname, rPath + "/static/documents-contact-account")
    // );
    await ensureDir(resolve(__dirname, "../../bin/chatbot-queue"));

    console.log(chalk.blue("DATABASE#2 -", chalk.cyan("Conectando...")));

    await prisma
      .$connect()
      .then(async () => {
        console.log(
          chalk.blue("DATABASE#2 -", chalk.green("Conectado com sucesso!"))
        );
        try {
          WebSocketIo(io);
          server.listen(process.env.PORT, () => {
            console.log(
              chalk.bgGrey("Servidor rodando na porta:", chalk.cyan("4000"))
            );
          });
          await startConnections();

          const pathQueue = resolve(__dirname, "../../bin/chatbot-queue");
          const dirPathQueue = readdirSync(pathQueue);

          for await (const fileName of dirPathQueue) {
            const chatbotId = Number(fileName.split(".")[0]);
            // await startChatbotQueue(chatbotId);
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
