import { EventEmitter } from "./eventEmitter.ts";
import { err, info, selectAction } from "./cli.ts";
import {
  clickClearButton,
  endBiDiSession,
  getBrowsingContext,
  handleBiDiEvent,
  inputText,
  navigatePage,
  newBiDiSession,
} from "./bidiHandlers.ts";

export class WebSocketManager {
  #socket: WebSocket;
  #eventEmitter: EventEmitter;
  #messageId: number = 0;

  constructor(url: string) {
    this.#socket = new WebSocket(url);
    this.#eventEmitter = new EventEmitter();

    this.#socket.onopen = async () => {
      // HACK: try catchはこっちでやった方がいいかも
      console.log(info("WebSocket connection opened"));
      await newBiDiSession(this);

      const ctx = await getBrowsingContext(this);
      await navigatePage(this, ctx);

      await selectAction({
        handleInput: async () => {
          await inputText(this, ctx);
        },
        handleClickClear: async () => {
          await clickClearButton(this, ctx);
        },
      });
    };

    this.#socket.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.id !== undefined) {
        this.#eventEmitter.emit(message.id.toString(), message);
      } else if (message.method) {
        handleBiDiEvent(message);
      }
    };

    this.#socket.onclose = () => {
      console.log(info("WebSocket connection closed"));
    };

    this.#socket.onerror = (e) => {
      console.error(err("WebSocket error"), e);
      Deno.exit();
    };
  }

  async cleanup() {
    if (this.#socket.readyState === WebSocket.OPEN) {
      await endBiDiSession(this);
      this.#socket.close();
    }
  }

  // deno-lint-ignore no-explicit-any
  sendMessage(data: any): Promise<any> {
    // TODO: reject時のエラーハンドリングを追加
    return new Promise((resolve, _) => {
      const id = this.#messageId++;
      data.id = id;

      // deno-lint-ignore no-explicit-any
      const listener = (response: any) => {
        this.#eventEmitter.off(id.toString(), listener);
        resolve(response);
      };

      this.#eventEmitter.on(id.toString(), listener);
      this.#socket.send(JSON.stringify(data));
    });
  }
}
