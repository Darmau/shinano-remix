import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { ServerBuild } from "react-router";

const loadBuild = async (): Promise<ServerBuild> => {
  const mod = await import("../build/server");
  return mod as unknown as ServerBuild;
};

export const onRequest = createPagesFunctionHandler({ build: loadBuild });
