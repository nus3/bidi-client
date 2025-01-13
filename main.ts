import { Input } from "@cliffy/prompt/input";
import { Select } from "@cliffy/prompt/select";
import { colors } from "@cliffy/ansi/colors";

const err = colors.bold.red;
const warn = colors.bold.yellow;
const info = colors.bold.blue;

class EventEmitter {
  // deno-lint-ignore ban-types
  private events: Map<string, Function[]> = new Map();

  // deno-lint-ignore ban-types
  on(event: string, listener: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  // deno-lint-ignore ban-types
  off(event: string, listener: Function) {
    const listeners = this.events.get(event);
    if (listeners) {
      this.events.set(event, listeners.filter((l) => l !== listener));
    }
  }

  // deno-lint-ignore no-explicit-any
  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(...args));
    }
  }
}

async function main() {
  const url = await Input.prompt({
    message: "Enter the URL of the browser to connect to",
    default: "ws://localhost:9222/session",
  });

  const eventEmitter = new EventEmitter();
  let messageId = 0; // メッセージIDのカウンタ
  const socket = new WebSocket(url);

  async function newBiDiSession() {
    try {
      const response = await sendMessage({
        method: "session.new",
        params: { capabilities: {} },
      });
      console.log("Session started:", response);
    } catch (error) {
      console.error("Error starting session:", error);
      cleanup();
    }
  }

  // WebSocket接続先にメッセージを送信し、応答を待つ関数
  // TODO: reject時のエラーハンドリングを追加
  function sendMessage(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      data.id = id;

      const listener = (response: any) => {
        eventEmitter.off(id.toString(), listener);
        resolve(response);
      };

      // リスナーを登録して、応答を待つ
      eventEmitter.on(id.toString(), listener);

      socket.send(JSON.stringify(data));
    });
  }

  async function cleanup() {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        // REF: https://w3c.github.io/webdriver-bidi/#command-session-end
        await sendMessage({ method: "session.end", params: {} });
        console.log("Session end.");
      } catch (error) {
        console.error("Error ending session:", error);
      }
      socket.close();
    }
  }

  socket.onopen = async (e) => {
    console.log(info("WebSocket connection opened"));
    await newBiDiSession();
  };

  socket.onmessage = (e) => {
    const message = JSON.parse(e.data);

    if (message.id !== undefined) {
      eventEmitter.emit(message.id.toString(), message);
    } else if (message.method) {
      console.log("Received event:", message);
    }
  };

  socket.onclose = (e) => {
    console.log(info("WebSocket connection closed"));
  };

  socket.onerror = (e) => {
    console.error(err("WebSocket error"), e);
  };

  // ctrl+cやcliの終了時にWebSocketを閉じる
  const signals = ["SIGINT", "SIGTERM"] as const;
  for (const sig of signals) {
    Deno.addSignalListener(sig, async () => {
      console.log(info(`Received ${sig}, closing WebSocket...`));
      await cleanup();
      Deno.exit();
    });
  }
}

main();
