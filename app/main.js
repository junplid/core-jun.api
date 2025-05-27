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
      pathBin = resolve(__dirname, "./dist/bin");
    } else {
      pathBin = resolve(__dirname, "./src/bin");
    }
    await ensureDir(resolve(__dirname, pathBin));
    if (!pathExistsSync(resolve(__dirname, pathBin + "/connections.json"))) {
      await writeFile(resolve(__dirname, pathBin + "/connections.json"), `[]`);
    }

    await ensureDir(resolve(__dirname, "./static/audio"));
    await ensureDir(resolve(__dirname, "./static/file"));
    await ensureDir(resolve(__dirname, "./static/image"));
    await ensureDir(resolve(__dirname, "./static/pdf"));
    await ensureDir(resolve(__dirname, "./static/video"));
    await ensureDir(resolve(__dirname, pathBin + "/chatbot-queue"));
  } catch (errors) {
    error(errors, 44);
    exit(2);
  }
})();
