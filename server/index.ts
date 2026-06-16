// Mono-process entry point (standalone): reads the port, listens. The request logic
// lives in http.ts (createAppHandler), shareable with the mutualised bucket-runner.
import { createAppServer, type ServerConfig } from "./http.js";

const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  productSlug: "portfolio",
};

createAppServer(config).listen(config.port, () =>
  console.log(`portfolio static server on :${config.port}`),
);
