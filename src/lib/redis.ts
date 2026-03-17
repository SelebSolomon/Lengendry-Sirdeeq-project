import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

client.connect()
  .then(() => console.log("Redis connected"))
  .catch((err) => console.error("Redis connection error:", err));

export default client;
