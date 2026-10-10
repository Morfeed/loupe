import { FeedController } from "../src/feed/controller";
import { redditAdapter } from "../src/reddit/adapter";

export default defineContentScript({
  matches: ["https://www.reddit.com/*"],
  runAt: "document_idle",
  async main() {
    if (!redditAdapter.isSupportedPage(window.location)) return;
    const controller = new FeedController(redditAdapter);
    await controller.start();
  },
});
