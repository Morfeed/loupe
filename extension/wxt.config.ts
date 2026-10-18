import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  /* Root shadcn components import their siblings through these paths */
  alias: {
    "@/components": "../components",
    "@/hooks": "../hooks",
    "@/lib": "../lib",
  },
  vite: () => ({
    plugins: [tailwindcss()],
    /* Root components resolve React from the root node_modules. Two React copies break hooks. */
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  }),
  manifest: {
    name: "Loupe",
    description: "Mark, hide, or remove Reddit posts, YouTube videos, and X posts that match your rules with AI.",
    permissions: ["storage", "tabs", "unlimitedStorage"],
    host_permissions: [
      "https://www.reddit.com/*",
      "https://www.youtube.com/*",
      "https://x.com/*",
      "https://api.groq.com/*",
      "https://api.typesafe.ai/*",
    ],
    action: {
      default_title: "Loupe",
    },
  },
});
