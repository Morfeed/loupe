import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "Loupe",
    description: "Mark, hide, or remove Reddit posts and YouTube videos that match your rules with AI.",
    permissions: ["storage", "tabs", "unlimitedStorage"],
    host_permissions: [
      "https://www.reddit.com/*",
      "https://www.youtube.com/*",
      "https://api.groq.com/*",
      "https://api.typesafe.ai/*",
    ],
    action: {
      default_title: "Loupe",
    },
  },
});
