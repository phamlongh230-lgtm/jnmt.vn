import { env } from "./lib/env";
import app from "./app";
import { logger } from "./lib/logger";
import { createWsServer } from "./ws";
import http from "http";

const server = http.createServer(app);
createWsServer(server);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
