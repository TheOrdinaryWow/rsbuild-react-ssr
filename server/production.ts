import fs from "node:fs";
import { join } from "node:path";
import { Transform } from "node:stream";
import { serve } from "bun";
import type { PipeableStream, RenderToPipeableStreamOptions } from "react-dom/server";

// @ts-ignore: will be there, babe
import { renderToPipeableStream as render } from "../dist/server/index.js";

// bundle files
import { entries } from "../dist/manifest.json" with { type: "json" };
import templateHtml from "../template.html" with { type: "text" };

function _serverRender() {
  return render as (options?: RenderToPipeableStreamOptions) => PipeableStream;
}

const hostname = process.env.HOSTNAME || "localhost";
const port = process.env.PORT || 3000;

serve({
  hostname,
  port,
  static: {
    "/static/*": async (request) => {
      const url = new URL(request.url);
      const pathSegment = url.pathname.slice("/static/".length);

      if (pathSegment.includes("../")) {
        return new Response("Forbidden", { status: 403 });
      }

      const filePath = join("dist/static", pathSegment);

      const file = Bun.file(filePath);
      const exists = await file.exists();

      if (!exists) {
        return new Response("File not found", { status: 404 });
      }

      const contentType = file.type;

      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    },
  },
  fetch() {
    try {
      // biome-ignore lint/complexity/useLiteralKeys: it should be dynamic, will be added in the future
      const { js, css } = entries["index"].initial;
      const tags = {
        script: js.map((file) => `<script src="${file}" defer></script>`).join(""),
        style: css.map((file) => `<link rel="stylesheet" href="${file}">`).join(""),
      };

      const [beforeContent, afterContent] = (templateHtml as string).split("<!--app-content-->");
      const headSection = beforeContent.replace("<!--app-head-->", `${tags.style}${tags.script}`);

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      const stream = _serverRender()({
        // bootstrapScripts: js,
        onShellReady() {
          writer.write(headSection);

          stream.pipe(
            new Transform({
              transform(chunk, _, callback) {
                writer.write(chunk);
                callback(null, chunk);
              },
              flush(callback) {
                writer.write(afterContent);
                writer.close();
                callback(null);
              },
            }),
          );
        },
        onError(err) {
          console.error(err);
          writer.write("Internal Server Error");
          writer.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/html",
          "X-Accel-Buffering": "no",
          "Cache-Control": "no-cache",
        },
      });
    } catch (err) {
      console.error("SSR render error, downgrade to CSR...\n", err);
      return new Response(Bun.file("./dist/index.html"));
    }
  },
});

console.log(`Server started at http://${hostname}:${port}`);
