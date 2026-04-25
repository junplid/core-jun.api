const { error } = require("console");
const { pathExistsSync, writeFile, ensureDir } = require("fs-extra");
const { resolve } = require("path");
const { exit } = require("process");
const { config } = require("dotenv");

config();

(async () => {
  try { 
    let pathBin = resolve(process.env.STORAGE_PATH, "bin");
    await ensureDir(pathBin);
    const file_connections = resolve(pathBin, "connections.json");
    if (!pathExistsSync(file_connections)) {
      await writeFile(file_connections, `[]`);
    }

    const file_test_agent = resolve(pathBin, "files-test.json");
    if (!pathExistsSync(file_test_agent)) {
      await writeFile(file_test_agent, `[]`);
    }

    await ensureDir(resolve(process.env.STORAGE_PATH, "static", "storage"));
    await ensureDir(resolve(pathBin, "chatbot-queue"));
  } catch (errors) {
    console.log("error", errors);
    error(errors, 44);
    exit(2);
  }
})();
