import mongoose from "mongoose";

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error(
    'Defina DATABASE_URL no .env (ex.: DATABASE_URL="mongodb://junplidroot:passwordjunplid@database:27017/junplid?authSource=admin")'
  );
}

type TMongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const cache: TMongooseCache = {
  conn: null,
  promise: null,
};

export async function mongo() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(
        "mongodb://junplidroot:passwordjunplid@mongo_junplid:27017/junplid?authSource=admin",
        {
          serverSelectionTimeoutMS: 20000,
        }
      )
      .then((m) => {
        mongoose.pluralize(null);
        mongoose.set("strictQuery", true);

        // if (process.env.NODE_ENV !== "production") {
        //   mongoose.set("debug", true);
        // }

        return m;
      })
      .catch((err) => {
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
