import mongoose from "mongoose";

type TMongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const cache: TMongooseCache = {
  conn: null,
  promise: null,
};

const url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo_junplid:27017/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;

export async function mongo() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(url, { serverSelectionTimeoutMS: 20000 })
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
