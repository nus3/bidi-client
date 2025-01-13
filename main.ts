import { WebSocketManager } from "./src/webSocketManager.ts";
import { getWebSocketUrl, info } from "./src/cli.ts";

async function main() {
  const url = await getWebSocketUrl();
  const ws = new WebSocketManager(url);

  // ctrl+cやcliの終了時にWebSocketを閉じる
  const signals = ["SIGINT", "SIGTERM"] as const;
  for (const sig of signals) {
    Deno.addSignalListener(sig, async () => {
      console.log(info(`Received ${sig}, closing WebSocket...`));
      await ws.cleanup();
      Deno.exit();
    });
  }
}

main();
