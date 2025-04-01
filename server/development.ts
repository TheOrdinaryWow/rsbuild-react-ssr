import fs from "node:fs";
import { type RsbuildDevServer, createRsbuild, loadConfig, logger } from "@rsbuild/core";
import express, { type Request, type Response, type NextFunction } from "express";
import type { ServerOptions } from "react-dom/server";

// bundle files
import templateHtml from "../template.html" with { type: "text" };

type Manifest = {
  allFiles: string[];
  entries: {
    [key: string]: {
      assets: string[];
      initial: {
        js: string[];
        css: string[];
      };
    };
  };
};

let manifest: Manifest;

const serverRender = (rsbuildServer: RsbuildDevServer) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const indexModule: { renderToString: (options?: ServerOptions) => string } = await rsbuildServer.environments.ssr.loadBundle("index");

    const markup = indexModule.renderToString();

    // biome-ignore lint/complexity/useLiteralKeys: it should be dynamic, will be added in the future
    const { js = [], css = [] } = manifest.entries["index"].initial;

    const scriptTags = js.map((url) => `<script src="${url}" defer></script>`).join("\n");
    const styleTags = css.map((file) => `<link rel="stylesheet" href="${file}">`).join("\n");

    const html = (templateHtml as string).replace("<!--app-content-->", markup).replace("<!--app-head-->", `${styleTags}\n${scriptTags}`);

    res.writeHead(200, {
      "Content-Type": "text/html",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache",
    });

    res.end(html);
  } catch (err) {
    logger.error("SSR render error:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export async function startDevServer() {
  const { content } = await loadConfig({});

  const rsbuild = await createRsbuild({
    rsbuildConfig: content,
  });

  rsbuild.onDevCompileDone(async () => {
    try {
      const _manifest = await fs.promises.readFile("./dist/manifest.json", "utf-8");
      manifest = JSON.parse(_manifest);
    } catch (err) {
      logger.error("Failed to read manifest file:", err);
    }
  });

  const app = express();

  const rsbuildServer = await rsbuild.createDevServer();
  const serverRenderMiddleware = serverRender(rsbuildServer);

  app.get(/^(?!\/rsbuild-hmr|\/static).*$/, async (req, res, next) => {
    try {
      await serverRenderMiddleware(req, res, next);
    } catch (err) {
      logger.error("SSR render error, downgrade to CSR...\n", err);
      next();
    }
  });

  app.use(rsbuildServer.middlewares);

  const httpServer = app.listen(rsbuildServer.port, () => {
    rsbuildServer.afterListen();

    console.log(`Server started at http://localhost:${rsbuildServer.port}`);
  });

  rsbuildServer.connectWebSocket({ server: httpServer });

  return {
    close: async () => {
      await rsbuildServer.close();
      httpServer.close();
    },
  };
}

startDevServer();
