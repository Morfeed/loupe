import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "Morfeed",
    description: "Highlight Reddit posts that match your rules with AI.",
    permissions: ["storage", "tabs"],
    host_permissions: [
      "https://www.reddit.com/*",
      "https://api.groq.com/*",
    ],
    action: {
      default_title: "Morfeed",
    },
  },
});
