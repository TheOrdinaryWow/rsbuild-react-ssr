import { StartClient } from "@tanstack/react-start";
import ReactDOM from "react-dom/client";

import { createRouter } from "./router";

const router = createRouter();

const rootEl = document.getElementById("root");

if (rootEl) {
  ReactDOM.hydrateRoot(document, <StartClient router={router} />);
}
