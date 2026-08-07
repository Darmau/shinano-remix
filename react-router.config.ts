import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // Cloudflare Pages 配置
  buildDirectory: "build",
} satisfies Config;
