import React from "react";
import {
  type RenderToPipeableStreamOptions,
  type ServerOptions,
  renderToPipeableStream as _renderToPipeableStream,
  renderToString as _renderToString,
} from "react-dom/server";
import App from "./App";

export function renderToPipeableStream(options?: RenderToPipeableStreamOptions) {
  return _renderToPipeableStream(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    options,
  );
}

export function renderToString(options?: ServerOptions) {
  return _renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    options,
  );
}
