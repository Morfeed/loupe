import { FeedController } from "../src/feed/controller";
import { youtubeAdapter } from "../src/youtube/adapter";

export default defineContentScript({
  matches: ["https://www.youtube.com/*"],
  runAt: "document_idle",
  async main() {
    const controller = new FeedController(youtubeAdapter);
    await controller.start();
  },
});
