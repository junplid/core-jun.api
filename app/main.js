const { error } = require("console");
const { pathExistsSync, writeFile, ensureDir } = require("fs-extra");
const { resolve } = require("path");
const { exit } = require("process");
const { config } = require("dotenv");

config();

(async () => {
  try {
    let pathBin = "";
    if (process.env?.NODE_ENV === "production") {
      pathBin = resolve(__dirname, "./bin");
    } else {
      pathBin = resolve(__dirname, "./bin");
    }
    await ensureDir(resolve(__dirname, pathBin));
    if (!pathExistsSync(resolve(__dirname, pathBin + "/connections.json"))) {
      await writeFile(resolve(__dirname, pathBin + "/connections.json"), `[]`);
    }
    if (!pathExistsSync(resolve(__dirname, pathBin + "/files-test.json"))) {
      await writeFile(resolve(__dirname, pathBin + "/files-test.json"), `[]`);
    }

    await ensureDir(resolve(__dirname, "./static/storage"));
    await ensureDir(resolve(__dirname, pathBin + "/chatbot-queue"));
  } catch (errors) {
    error(errors, 44);
    exit(2);
  }
})();
