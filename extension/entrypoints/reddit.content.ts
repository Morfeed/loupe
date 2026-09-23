import { RedditController } from "../src/reddit/controller";
import { isSupportedRedditFeed } from "../src/reddit/adapter";

export default defineContentScript({
  matches: ["https://www.reddit.com/*"],
  runAt: "document_idle",
  async main() {
    if (!isSupportedRedditFeed(window.location)) return;
    const controller = new RedditController();
    await controller.start();
  },
});
