import { WebSocketManager } from "./webSocketManager.ts";

export async function handleBiDiSession(ws: WebSocketManager) {
  try {
    // REF: https://w3c.github.io/webdriver-bidi/#command-session-new
    const response = await ws.sendMessage({
      method: "session.new",
      params: { capabilities: {} },
    });
    console.log("Session started:", response);
  } catch (error) {
    console.error("Error starting session:", error);
    await ws.cleanup();
  }
}

export async function handleNavigatePage(ws: WebSocketManager) {
  try {
    // REF: https://w3c.github.io/webdriver-bidi/#command-browsingContext-getTree
    const res = await ws.sendMessage({
      method: "browsingContext.getTree",
      params: {},
    });
    console.log("browsingContext.getTree", res);

    const context = res.result.contexts[0].context;
    console.log("context", context);

    await ws.sendMessage({
      method: "browsingContext.navigate",
      params: {
        context,
        url: "https://example.com",
        wait: "complete",
      },
    });
  } catch (error) {
    console.error("Error navigating page", error);
    await ws.cleanup();
  }
}

export async function handleEndSession(ws: WebSocketManager) {
  try {
    // REF: https://w3c.github.io/webdriver-bidi/#command-session-end
    await ws.sendMessage({ method: "session.end", params: {} });
    console.log("Session end.");
  } catch (error) {
    console.error("Error ending session:", error);
  }
}

// TODO: methodによる分岐
// deno-lint-ignore no-explicit-any
export function handleBiDiEvent(message: any) {
  // TODO: BiDiイベントの処理
  switch (message.method) {
    case "event.methodName":
      console.log("Received specific event:", message);
      // イベントに対する処理をここに追加
      break;
    default:
      console.log("Received event:", message);
      break;
  }
}
