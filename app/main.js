const { error } = require("console");
const { pathExistsSync, writeFile, ensureDir } = require("fs-extra");
const { resolve } = require("path");
const { exit } = require("process");

(async () => {
  try {
    const fileRoot = resolve(__dirname, "./src/config");
    if (!pathExistsSync(fileRoot)) {
      await ensureDir(fileRoot);
      await writeFile(
        fileRoot + "/root.json",
        `{"token-asaas": "", "endpoint-asaas": "", "host": "", "port": 0, "secure": false, "authUser": "", "authPass": "", "email": ""}`
      );
    }

    await ensureDir(resolve(__dirname, "./src/bin/instructions"));
    if (!pathExistsSync(resolve(__dirname, "./src/bin/connections.json"))) {
      await writeFile(resolve(__dirname, "./src/bin/connections.json"), `[]`);
    }

    await ensureDir(resolve(__dirname, "./static/audio"));
    await ensureDir(resolve(__dirname, "./static/file"));
    await ensureDir(resolve(__dirname, "./static/image"));
    await ensureDir(resolve(__dirname, "./static/pdf"));
    await ensureDir(resolve(__dirname, "./static/video"));
    await ensureDir(resolve(__dirname, "./static/documents-contact-account"));
    await ensureDir(resolve(__dirname, "./src/bin/chatbot-queue"));

    for await (const pg of [
      "about-whabot.txt",
      "faq.txt",
      "help-center.txt",
      "report-bugs-and-suggestions.txt",
      "support-contacts.txt",
      "terms-and-conditions.txt",
      "whabot-university.txt",
      "whats-new.txt",
    ]) {
      if (!pathExistsSync(resolve(__dirname, `./static/text/${pg}`))) {
        await ensureDir(resolve(__dirname, "./static/text/"));
        await writeFile(resolve(__dirname, `./static/text/${pg}`), pg);
      }
    }
  } catch (errors) {
    error(errors, 44);
    exit(2);
  }
})();
