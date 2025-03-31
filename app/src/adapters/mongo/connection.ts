import mongoose from "mongoose";
import chalk from "chalk";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb://userdefault:passworddefault@mongo_junplid:27017/Chatbot?authSource=admin"
    );
    console.log(chalk.blue("DATABASE#1 -", chalk.cyan("Conectando...")));
    console.log(
      chalk.blue("DATABASE#1 -", chalk.green("Conectado com sucesso!"))
    );
  } catch (error) {
    console.error("Erro ao conectar com MongoDB:", error);
  }
};

(async () => {
  new Promise<void>((res) => {
    let attempts = 0;
    const run = () => {
      if (attempts < 2) {
        setTimeout(() => {
          connectToDatabase()
            .catch(() => {
              attempts += 1;
              run();
            })
            .then(res);
        }, 2000);
      }
    };
    run();
  });
})();
