import { buildApp } from "./app";
import { config } from "./config";

const app = await buildApp({ logger: true });
await app.listen({ port: config.API_PORT, host: "0.0.0.0" });
