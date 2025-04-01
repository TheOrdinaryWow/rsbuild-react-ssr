import { StartClient } from "@tanstack/react-start";
import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "@tanstack/react-router";
import { createRouter } from "./router";

const router = createRouter();

const rootEl = document.getElementById("root");

if (rootEl) {
  ReactDOM.hydrateRoot(document, <StartClient router={router} />);
}
