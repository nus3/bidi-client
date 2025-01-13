## Cliffy

https://cliffy.io/docs@v1.0.0-rc.7

- command と prompt の二つのモジュールがある

## Deno + WebSockets

https://docs.deno.com/examples/websocket/

- WebSocket インスタンスを生成すれば良さそう

## TODO

- コマンドの prompt に応じてフォームの値を入力したり、サブミットする cli

以下、エラーの解消から

```
Session started: {
  type: "error",
  id: 0,
  error: "invalid session id",
  message: "WebDriver session does not exist, or is not active",
  stacktrace: "RemoteError@chrome://remote/content/shared/RemoteError.sys.mjs:8:8\n" +
    "WebDriverError@chrome://remote/content/shared/webdriver/Errors.sys.mjs:193:5\n" +
    "InvalidSessionIDError@chrome://remote/content/shared/webdriver/Errors.sys.mjs:448:5\n" +
    "assert.that/<@chrome://remote/content/shared/webdriver/Assert.sys.mjs:515:13\n" +
    "assert.session@chrome://remote/content/shared/webdriver/Assert.sys.mjs:37:4\n" +
    "onPacket@chrome://remote/content/webdriver-bidi/WebDriverBiDiConnection.sys.mjs:220:21\n" +
    "onMessage@chrome://remote/content/server/WebSocketTransport.sys.mjs:127:18\n" +
    "handleEvent@chrome://remote/content/server/WebSocketTransport.sys.mjs:109:14\n"
}
```
