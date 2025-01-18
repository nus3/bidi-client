## Explainer

https://github.com/w3c/webdriver-bidi/blob/main/explainer.md

Bidirectional WebDriver Protocol

### Overview

- TPAC 2019 ワーキング グループ ミーティングで議論されたシナリオと解決策を取り入れている
- このプロトコルは、WebSockets 上で JSON-RPC メッセージングを使用して通信を行う
- 新しいプロトコルが既存のプロトコルとどのように相互運用できるかについても議論する
- ドキュメントには JSON API 仕様も併記されている

### Goals

- 主要なシナリオをサポート
  - DOM イベントのリスニング
  - ブラウザでの動作を記録（コンソールや JS エラーを含む）
  - すべての JS エラーで迅速に失敗
  - バックエンドのモックとネットワークリクエストのインターセプト
  - トラフィックの記録
  - 全ページのスクリーンショット
  - ネイティブの開発ツールプロトコルへのアクセス
  - iframe やドキュメントの動的変更
  - パフォーマンスのタイミング
  - 新しいコンテキストの通知
  - ブートストラップスクリプト
- 古典的な WebDriver コマンドとの相互運用性
  - 既存のテスト／自動化コードを段階的にアップグレードできるようにする。
  - 既存の WebDriver コマンドと機能の同等性
  - 既存のコマンドを新しいプロトコルで送信できるようにし、新しいテスト／自動化コードを完全に新しいプロトコルで記述できるようにする。
  - 適切な場合に双方向通信を活用するために機能を更新。未処理のプロンプトやポーリングが一般的なシナリオに有用。
- 機械および人間が読みやすい API 仕様
  - 最新の言語バインディング、ドキュメント、およびテストケースを生成しやすくする。
  - ネイティブの開発ツールプロトコルに簡単にマッピング可能
  - ブラウザベンダーが実装および維持しやすい。
  - クライアントがブラウザ固有の開発ツールプロトコル機能で WebDriver 自動化を強化できるようにする。

## WebDriver BiDi Core Functionality

https://github.com/w3c/webdriver-bidi/blob/main/proposals/core.md

### Protocol

- Transport 層は WebSockets
- メッセージフォーマットは[JSON-RPC 2.0](https://www.jsonrpc.org/specification)
  - [OpenRPC](https://open-rpc.org/)も付随
- 新しいプロトコルのインターフェース
  - クライアントからサーバーへのコマンドのセット
  - サーバーからクライアントへのイベントのセット
- クライアントはコマンドを送信し、イベントをリッスンできる

### commands

- コマンドには「method」名とオプションの「params」が含まれる

```json
{
  "id": 0,
  "method": "getTitle",
  "params": { "browsingContextId": "<ID>" }
}
```

- レスポンスには応答しているコマンドの id が含まれる

```json
{
  "id": 0,
  "result": { "title": "Example Domain" }
}
```

### events

- WebSockets を介して大量のトラフィックを生成する可能性があるのでオプトイン方式にすべき
- クライアント側でイベントをリッスンするための最初のステップは subscribe コマンドを送信すること

```json
{
  "id": 0,
  "method": "subscribe",
  "params": { "event": "scriptContextCreated" }
}
```

- このコマンドを送信するとサーバー側は`scriptContextCreated`イベントをクライアントに送信する
- イベントメッセージには id プロパティがない
- イベントが発生して、そのまま終了するため

```json
{
  "method": "scriptContextCreated",
  "params": { "scriptContextId": "<ID>" }
}
```

### establish bidirectional session

- capabilities の`webSocketUrl`が true の場合、双方向通信が有効になる

```json
{
    "capabilities": {
        "alwaysMatch": {
            ...
            "webSocketUrl": true
        }
    }
}
```

### Message Routing

- 各 WebSocket で単一のセッションに結びつけられるので、どのセッションを対象にするかの指定は必要ない
- しかし、どのブラウジングコンテキスト、フレーム、要素をコマンドが対象にしているかを識別する方法が必要
- WebDriver には現在のトップレベルのブラウジングコンテキストと現在のブラウジングコンテキストという概念がある
- 特定のブラウジングコンテキストで実行する必要があるコマンドは、クライアントはまず「Get Window Handles」や「Find Element」といったコマンドを使用して他のコンテキストを発見し、「Switch To Window」や「Switch To Frame」コマンドを使ってそれらに切り替える必要がある
- WebDriver は以下のような階層としてモデル化
- WebDriver セッション
  - ウィンドウ（トップレベルのブラウジングコンテキスト）
    - フレーム（ネストされたブラウジングコンテキスト）
      - 要素
- サービスワーカーや異なる JS 領域などの新しいコンテキストをサポートする議論が今年の TPAC で行われたが解決策には至らなかった
- 現在の WebDriver のウィンドウではブラウジングコンテキストのみ考慮している
- また、ブラウジングコンテキストとスクリプトコンテキストの概念が混同している
- 実際には WebDriver はドキュメントスクリプトコンテキストのみが見える
  - 通常は Web Worker、Service Worker、Web 拡張などのスクリプトコンテキストへのアクセスを妨げている
- 新しいシナリオを実現する良い時期で、以下は新しい概念を含むモデル
- WebDriver セッション
  - ターゲット（以前の「ウィンドウ」。ページやサービスワーカーになり得る）
    - ブラウジングコンテキスト（別名「フレーム」）
      - 要素
  - スクリプトコンテキスト（ドキュメント、ウェブワーカー、サービスワーカーなど）
- 従来の WebDriver と後方互換性があるようにターゲットはウィンドウと同様に動作する
- 要素への参照は特定のブラウジングコンテキスト内でのみ有効である
- 要素に対して操作を行うコマンドやイベントはどのブラウジングコンテキストに属しているか指定する必要がある
  - 例えば getElementText のようなコマンドには「browsingContextId」と「elementId」パラメータの両方が必要
- ブラウジングコンテキストへのコマンド送信

```json
{
  "id": 0,
  "method": "navigateTo",
  "params": { "browsingContextId": "<ID>", "url": "http://example.com" }
}
```

- スクリプトコンテキストへのコマンド送信

```json
{
  "id": 0,
  "method": "executeSync",
  "params": {
    "scriptContextId": "<ID>",
    "script": "return document.title;",
    "args": []
  }
}
```

- ターゲットを閉じる

```json
{
  "id": 0,
  "method": "closeTarget",
  "params": { "targetId": "<ID>" }
}
```

### Target Discovery

- クライアントがコンテキストを見つける方法
- 双方向の世界では、サーバーが新しいターゲットが開かれたときや、新しいフレームやスクリプトコンテキストがアタッチされたときに、クライアントに積極的に通知することができます。クライアントがこれらのイベントを登録できる方法を提供するべき

トップレベルターゲットの取得

- コマンド

```json
{
  "id": 0,
  "method": "getTargets",
  "params": {}
}
```

- レスポンス

```json
{
  "id": 0,
  "result": {
    "targets": [
        { "targetId": "<ID>", "type": "page", "url": "about:blank" }
        ...
    ]
  }
}
```

- イベント
  - targetCreated、targetClosed イベントをリッスンすることで、クライアントはポーリングを必要とせずに新しいウィンドウを待つことができる

```json
{
  "method": "targetCreated",
  "params": {
    "targetId": "<ID>",
    "type": "serviceWorker",
    "url": "sw.js"
  }
}
```

```json
{
  "method": "targetClosed",
  "params": {
    "targetId": "<ID>"
  }
}
```

ブラウジングコンテキストの取得

- ブラウジングコンテキストには親子関係がある
- コマンド

```json
{
  "id": 0,
  "method": "getBrowsingContexts",
  "params": {
    "targetId": "<ID>"
  }
}
```

- レスポンス

```json
{
  "id": 0,
  "result": {
    "browsingContexts": [
      { "browsingContextId": "<ID #0>" },
      { "browsingContextId": "<ID #1>", "parentBrowsingContextId": "<ID #0>" },
      { "browsingContextId": "<ID #2>", "parentBrowsingContextId": "<ID #1>" },
      { "browsingContextId": "<ID #3>", "parentBrowsingContextId": "<ID #0>" }
    ]
  }
}
```

- イベント

```json
{
  "method": "browsingContextAttached",
  "result": {
    "parentBrowsingContextId": "<ID #1>",
    "browsingContextId": "<ID #4>"
  }
}
```

```json
{
  "method": "browsingContextDetached",
  "result": {
    "browsingContextId": "<ID #3>"
  }
}
```

スクリプトコンテキストの取得

- スクリプトコンテキストには親子関係がない
- ドキュメントスクリプトは紐づけられるブラウジングコンテキストの参照を持つべき
- コマンド

```json
{
  "id": 0,
  "method": "getScriptContexts",
  "params": {
    "targetId": "<ID>"
  }
}
```

- レスポンス

```json
{
  "id": 0,
  "result": {
    "scriptContexts": [
      {
        "scriptContextId": "<ID #1>",
        "type": "page",
        "browsingContextId": "<ID>"
      },
      {
        "scriptContextId": "<ID #2>",
        "type": "page",
        "browsingContextId": "<ID>"
      },
      {
        "scriptContextId": "<ID #3>",
        "type": "worker",
        "browsingContextId": "<ID>"
      }
    ]
  }
}
```

- イベント
- 「scriptContextCreated」および「scriptContextClosed」イベントがあるべき

### Examples

以下は WebDriver BiDi を採用した仮想ライブラリのサンプルコード

- ユーザープロンプト
  - 従来だとポーリングを通じてユーザープロンプトを知ることができた
  - 新しいプロトコルの alertOpened イベントを使用することで、クライアントはプロンプトをすぐ知ることができる

```js
// alertOpenedイベントを有効にし、リスナーを追加します。
driver.on("alertOpened", async (params) => {
  // イベントパラメータからアラートメッセージを取得し、アラートを処理します。
  assert(params.message === "Please enter your name");
  await driver.sendAlertText("Joe");
  await driver.acceptAlert();
});
```

- 新しいウィンドウ
  - targetCreated イベントを使用して、クライアントはポーリングを必要とせずに新しいウィンドウを知れる

```js
const element = await driver.findElement({
  browsingContext: "<ID>",
  using: "css selector",
  value: "#openWindow",
});

// targetCreatedイベントのリスニングを開始し、イベントが発生すると解決されるPromiseを返します。
const promise = driver.onceTargetCreated();

// ボタンをクリックして新しいウィンドウを開きます。
await element.click();

// Promiseを待機し、新しく作成されたウィンドウターゲットを取得します。
const target = await promise;

// 新しいターゲットにコマンドを送信します。
const browsingContexts = await driver.getBrowsingContexts({
  target: target.id,
});
```
