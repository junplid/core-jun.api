const { error } = require("console");
const { pathExistsSync, writeFile, ensureDir } = require("fs-extra");
const { resolve } = require("path");
const { exit } = require("process");

(async () => {
  try {
    if (!pathExistsSync(resolve(__dirname, "./bin/connections.json"))) {
      await ensureDir(resolve(__dirname, "./bin/connections.json"));
      await writeFile(resolve(__dirname, "./bin/connections.json"), `[]`);
    }

    await ensureDir(resolve(__dirname, "./static/audio"));
    await ensureDir(resolve(__dirname, "./static/file"));
    await ensureDir(resolve(__dirname, "./static/image"));
    await ensureDir(resolve(__dirname, "./static/pdf"));
    await ensureDir(resolve(__dirname, "./static/video"));
    await ensureDir(resolve(__dirname, "./bin/chatbot-queue"));
  } catch (errors) {
    error(errors, 44);
    exit(2);
  }
})();
