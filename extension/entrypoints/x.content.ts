import { FeedController } from "../src/feed/controller";
import { xAdapter } from "../src/x/adapter";

export default defineContentScript({
  matches: ["https://x.com/*"],
  runAt: "document_idle",
  async main() {
    const controller = new FeedController(xAdapter);
    await controller.start();
  },
});
