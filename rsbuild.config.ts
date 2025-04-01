import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  environments: {
    web: {
      output: {
        target: "web",
        manifest: true,
      },
      source: {
        entry: {
          index: "./src/entry-client",
        },
      },
    },
    ssr: {
      output: {
        target: "node",
        distPath: {
          root: "dist/server",
        },
      },
      source: {
        entry: {
          index: "./src/entry-server",
        },
      },
    },
  },
  tools: {
    htmlPlugin: false,
  },
});
