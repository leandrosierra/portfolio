// Mono-process entry point (standalone): reads config, listens. The request logic lives
// in http.ts (createAppHandler), shareable with the mutualised bucket-runner.
import { readServerConfig } from "./config.js";
import { createAppServer } from "./http.js";

const config = readServerConfig();
createAppServer(config).listen(config.port, () =>
  console.log(`portfolio static server on :${config.port}`),
);
