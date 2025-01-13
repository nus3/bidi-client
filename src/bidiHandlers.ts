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

    const targetURL = "https://nus3.github.io/ui-labs/scheduler-yield/";
    // REF: https://w3c.github.io/webdriver-bidi/#command-browsingContext-navigate
    await ws.sendMessage({
      method: "browsingContext.navigate",
      params: {
        context,
        url: targetURL,
        wait: "complete",
      },
    });

    // locateを使い対象の要素を取得
    // REF: https://w3c.github.io/webdriver-bidi/#command-browsingContext-locateNodes
    const locateNodesResponse = await ws.sendMessage({
      method: "browsingContext.locateNodes",
      params: {
        context,
        // REF: https://w3c.github.io/webdriver-bidi/#type-browsingContext-Locator
        locator: {
          type: "css",
          value: "input[type='text']",
        },
      },
    });
    if (locateNodesResponse.result.nodes.length === 0) {
      console.error("No nodes found.");
      return;
    }

    const elementNode = locateNodesResponse.result.nodes[0];
    console.log("Element found:", elementNode);

    // `type: "pointer"`で element を指定するときは`BiDi.InputOrigin`を使ってる
    // https://github.com/puppeteer/puppeteer/blob/87b667fc8ea3bc9a4661f9cdda9dd78b248a4283/packages/puppeteer-core/src/bidi/Input.ts#L416

    // 元の chromium-bidi から型を確認してみると以下になる
    // https://github.com/GoogleChromeLabs/chromium-bidi/blob/684ec4063d31323b5c87d9b24f985433f7e27dab/src/protocol/generated/webdriver-bidi.ts#L2112
    const sharedId = elementNode.sharedId;
    const origin = {
      type: "element",
      element: {
        sharedId,
      },
    };

    // 対象の要素に対してクリック
    await ws.sendMessage({
      // REF: https://w3c.github.io/webdriver-bidi/#command-input-performActions
      method: "input.performActions",
      params: {
        context,
        actions: [
          {
            type: "pointer",
            id: "mouse",
            actions: [
              {
                type: "pointerMove",
                x: 0,
                y: 0,
                origin,
              },
              {
                type: "pointerDown",
                // 0を指定することで、左クリックをシミュレートする？
                // TODO: 仕様書の記述を確認する

                // puppeteerの実装を見ると0がleft、1がmiddle、2がrightっぽい
                // REF: https://github.com/puppeteer/puppeteer/blob/87b667fc8ea3bc9a4661f9cdda9dd78b248a4283/packages/puppeteer-core/src/bidi/Input.ts#L433-L446
                button: 0,
              },
              {
                type: "pointerUp",
                button: 0,
              },
            ],
          },
        ],
      },
    });

    // キーボード入力
    await ws.sendMessage({
      method: "input.performActions",
      params: {
        context,
        actions: [
          {
            type: "key",
            id: "keyboard",
            actions: [
              {
                type: "keyDown",
                value: "H",
              },
              {
                type: "keyUp",
                value: "H",
              },
            ],
          },
        ],
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
