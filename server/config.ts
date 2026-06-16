// Config serveur du portfolio. Exporte `readServerConfig(env)` requis par le
// bucket-runner mutualisé (il importe server/dist/config.js et appelle readServerConfig
// avec l'env de l'app) ET par l'entrée mono (index.ts).
export type ServerConfig = {
  port: number;
  productSlug: string;
};

export function readServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    port: Number(env.PORT) || 3000,
    productSlug: env.PUBLIC_PRODUCT_SLUG || "portfolio",
  };
}
