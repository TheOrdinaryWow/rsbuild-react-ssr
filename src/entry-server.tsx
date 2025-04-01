import { StartServer } from "@tanstack/react-start/server";
import React from "react";
import {
  type RenderToPipeableStreamOptions,
  type ServerOptions,
  renderToPipeableStream as _renderToPipeableStream,
  renderToString as _renderToString,
} from "react-dom/server";

import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { createRouter } from "./router";

// const memoryHistory = createMemoryHistory({
//   initialEntries: [opts.url],
// });

export async function renderToPipeableStream(url: string, options?: RenderToPipeableStreamOptions) {
  const router = createRouter();

  const memoryHistory = createMemoryHistory({
    initialEntries: [url],
  });

  router.update({
    history: memoryHistory,
  });

  await router.load();

  return _renderToPipeableStream(
    <React.StrictMode>
      <StartServer router={router} />
    </React.StrictMode>,
    options,
  );
}

export async function renderToString(url: string, options?: ServerOptions) {
  const router = createRouter();

  const memoryHistory = createMemoryHistory({
    initialEntries: [url],
  });

  router.update({
    history: memoryHistory,
  });

  await router.load();

  return _renderToString(
    <React.StrictMode>
      <StartServer router={router} />
    </React.StrictMode>,
    options,
  );
}
