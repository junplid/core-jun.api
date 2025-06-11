import { readFile, writeFile, writeFileSync } from "fs-extra";
import { resolve } from "path";
import { Server } from "socket.io";
import {
  Baileys,
  CacheSessionsBaileysWA,
  killConnectionWA,
} from "../../adapters/Baileys";
import { cacheAccountSocket } from "./cache";
import {
  cacheConnectionsWAOnline,
  cacheTestAgentAI,
} from "../../adapters/Baileys/Cache";
import { prisma } from "../../adapters/Prisma/client";
import OpenAI from "openai";

interface PropsCreateSessionWA_I {
  connectionWhatsId: number;
  number?: string;
}

interface VectorStoreTest {
  apiKey: string;
  vectorStoreId: string;
  tokenTest: string;
  files: { localId: number; openFileId: string }[];
}

let pathFilesTest = "";
if (process.env.NODE_ENV === "production") {
  pathFilesTest = resolve(__dirname, `./bin/files-test.json`);
} else {
  pathFilesTest = resolve(__dirname, `../../bin/files-test.json`);
}

export const WebSocketIo = (io: Server) => {
  io.on("connection", async (socket) => {
    const { auth } = socket.handshake;

    const stateUser = cacheAccountSocket.get(auth.accountId);

    if (!stateUser) {
      cacheAccountSocket.set(auth.accountId, {
        listSocket: [socket.id],
      });
    } else {
      stateUser.listSocket.push(socket.id);
    }

    socket.on("create-session", async (data: PropsCreateSessionWA_I) => {
      const connectionDB = await prisma.connectionWA.findFirst({
        where: {
          id: data.connectionWhatsId,
          Business: { accountId: auth.accountId },
          interrupted: false,
        },
        select: { type: true, name: true },
      });
      if (!connectionDB) {
        socket.emit("error-connection-wa", {
          message: "Conexão não encontrada ou você não está autorizado!",
          ...data,
        });
        return;
      }
      await Baileys({
        accountId: auth.accountId,
        connectionWhatsId: data.connectionWhatsId,
        socket: socket,
        number: data.number,
        onConnection: async (connection) => {
          socket.emit(
            `status-session-${data.connectionWhatsId}`,
            connection ?? "close"
          );
          socket.emit(`status-connection`, {
            connectionId: data.connectionWhatsId,
            connection: "sync",
          });
          setTimeout(() => {
            socket.emit(`status-connection`, {
              connectionId: data.connectionWhatsId,
              connection: connection ?? "close",
            });
          }, 4500);

          let path = "";
          if (process.env?.NODE_ENV === "production") {
            path = resolve(__dirname, `./bin/connections.json`);
          } else {
            path = resolve(__dirname, `../../bin/connections.json`);
          }

          readFile(path, (err, file) => {
            if (err) {
              return console.log(err);
            }
            const listConnections: CacheSessionsBaileysWA[] = JSON.parse(
              file.toString()
            );

            const alreadyExists = listConnections.some(
              ({ connectionWhatsId }) =>
                connectionWhatsId === data.connectionWhatsId
            );

            if (!alreadyExists) {
              listConnections.push({
                accountId: auth.accountId,
                connectionWhatsId: data.connectionWhatsId,
              });
              writeFileSync(path, JSON.stringify(listConnections));
            }
          });
        },
      });
    });

    socket.on("revoke-session", async (data: PropsCreateSessionWA_I) => {
      const isconnected = cacheConnectionsWAOnline.get(data.connectionWhatsId);
      if (isconnected) return;
      const connectionDB = await prisma.connectionWA.findFirst({
        where: {
          id: data.connectionWhatsId,
          Business: { accountId: auth.accountId },
          interrupted: false,
        },
        select: { type: true, name: true },
      });
      if (!connectionDB) {
        socket.emit("error-connection-wa", {
          message: "Conexão não encontrada ou você não está autorizado!",
          ...data,
        });
        return;
      }
      await killConnectionWA(data.connectionWhatsId, auth.accountId);
    });

    socket.on("agent-ai:clear-tokenTest", async (tokenTest: string) => {
      cacheTestAgentAI.delete(tokenTest);
      const vsTest: VectorStoreTest[] = JSON.parse(
        (await readFile(resolve(pathFilesTest), "utf-8")) || "[]"
      );

      const existingTokenTest = vsTest.find((v) => v.tokenTest === tokenTest);
      if (existingTokenTest) {
        const openai = new OpenAI({ apiKey: existingTokenTest.apiKey });
        const filesVs = await openai.vectorStores.files.list(
          existingTokenTest.vectorStoreId
        );
        await openai.vectorStores.delete(existingTokenTest.vectorStoreId);
        for (const file of filesVs.data) {
          await openai.files.delete(file.id);
        }
        const updatedVsTest = vsTest.filter((v) => v.tokenTest !== tokenTest);
        await writeFile(
          resolve(pathFilesTest),
          JSON.stringify(updatedVsTest, null, 2)
        );
      }
    });

    socket.on("disconnect", async (reason) => {
      const stateUser = cacheAccountSocket.get(auth.accountId);
      if (stateUser) {
        stateUser.listSocket = stateUser.listSocket.filter(
          (ids) => ids !== socket.id
        );
        if (stateUser.listSocket.length === 0) {
          cacheAccountSocket.delete(auth.accountId);
        }
      }
    });
  });
};
