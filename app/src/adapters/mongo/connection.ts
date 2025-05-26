import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb://junplidroot:passwordjunplid@mongo_junplid:27017/junplid?authSource=admin"
    );
    console.log("DATABASE#1 -", "Conectando...");
    console.log("DATABASE#1 -", "Conectado com sucesso!");
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
