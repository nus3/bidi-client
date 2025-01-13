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

## WebDriver BiDi の利点

https://github.com/lana-20/selenium-webdriver-bidi

## WebDriver BiDi の実装状況

https://wpt.fyi/results/webdriver/tests/bidi?label=master&label=experimental&aligned&q=tests%2Fbidi

## TODO

- https://nus3.github.io/ui-labs/scheduler-yield/
- に対して対象の input に文字列を入力する（いい感じに関数化）
- 対象のボタンをクリックする
- いい感じのリファクタ
- event と script 周りを実装してみる
