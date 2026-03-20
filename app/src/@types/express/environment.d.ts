declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "dev" | "prod";
      ENV_PORT: "4001" | "4000";
      STORAGE_PATH: string;
      DATABASE_URL: string;
      FIREBASE_SERVICE_ACCOUNT_BASE64: string;
      MASTER_KEY: string;
      SECRET_TOKEN_AUTH: string;
      HASH_SECRET: string;
      POSTGRES_DB: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      MONGO_INITDB_DATABASE: string;
      MONGO_INITDB_ROOT_USERNAME: string;
      MONGO_INITDB_ROOT_PASSWORD: string;
    }
  }
}

export {};
