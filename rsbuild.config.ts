import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    htmlPlugin: false,
    rspack: {
      plugins: [
        TanStackRouterRspack({
          routesDirectory: "./src/routes",
          generatedRouteTree: "./src/routeTree.gen.ts",
          // routeFileIgnorePrefix: "_",
          quoteStyle: "double",
          semicolons: true,
          autoCodeSplitting: true,
        }),
      ],
    },
  },
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
});
