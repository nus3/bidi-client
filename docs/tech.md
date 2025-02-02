実装上のメモ

## firefox

firefox を cli 上で起動する際のコマンド

```shell
 cd /Applications/Firefox.app/Contents/MacOS
 ./firefox --remote-debugging-port
```

## Cliffy

https://cliffy.io/docs@v1.0.0-rc.7

- command と prompt の二つのモジュールがある

## Deno + WebSockets

https://docs.deno.com/examples/websocket/

- WebSocket インスタンスを生成すれば良さそう

## WebDriverIO

BiDi 周りのハンドラーの実装
https://github.com/webdriverio/webdriverio/blob/a273d38d5724c27656fa6e8d7b8b79a716a9f00a/packages/webdriver/src/bidi/handler.ts

doc
https://webdriver.io/docs/api/webdriverBidi

## puppeteer

BiDi で input.performActions してそうな実装箇所
https://github.com/puppeteer/puppeteer/blob/87b667fc8ea3bc9a4661f9cdda9dd78b248a4283/packages/puppeteer-core/src/bidi/core/BrowsingContext.ts#L486

`type: "key"`の場合は 1 文字ずつ入力っぽい
https://github.com/puppeteer/puppeteer/blob/87b667fc8ea3bc9a4661f9cdda9dd78b248a4283/packages/puppeteer-core/src/bidi/Input.ts#L54

`type: "pointer"`で element を指定するときは`BiDi.InputOrigin`を使ってる
https://github.com/puppeteer/puppeteer/blob/87b667fc8ea3bc9a4661f9cdda9dd78b248a4283/packages/puppeteer-core/src/bidi/Input.ts#L416

元の chromium-bidi から型を確認してみると以下になる
https://github.com/GoogleChromeLabs/chromium-bidi/blob/684ec4063d31323b5c87d9b24f985433f7e27dab/src/protocol/generated/webdriver-bidi.ts#L2112

```
  export type ElementOrigin = {
    type: 'element';
    element: Script.SharedReference;
  };

export type SharedReference = {
    sharedId: Script.SharedId;
    handle?: Script.Handle;
  }
```

## session.subscription

https://www.w3.org/TR/webdriver-bidi/#command-session-subscribe

```
// Command Type
session.Subscribe = (
  method: "session.subscribe",
  params: session.SubscriptionRequest
)
// Result Type
session.SubscribeResult = {
  subscription: session.Subscription,
}
```

https://www.w3.org/TR/webdriver-bidi/#type-session-SubscriptionRequest

```
session.SubscriptionRequest = {
  events: [+text],
  ? contexts: [+browsingContext.BrowsingContext],
  ? userContexts: [+browser.UserContext],
}
```

chromium-bidi の型定義
https://github.com/GoogleChromeLabs/chromium-bidi/blob/684ec4063d31323b5c87d9b24f985433f7e27dab/src/protocol/generated/webdriver-bidi.ts#L205-L211
