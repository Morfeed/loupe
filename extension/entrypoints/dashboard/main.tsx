import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import { App } from "./App";

/* The design system reads a .dark class. Extension pages follow the system theme. */
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");
function applyScheme() {
  document.documentElement.classList.toggle("dark", darkScheme.matches);
}
applyScheme();
darkScheme.addEventListener("change", applyScheme);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
