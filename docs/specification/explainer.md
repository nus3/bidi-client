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

## WebDriver BiDi Bootstrap Scripts

https://github.com/w3c/webdriver-bidi/blob/main/proposals/bootstrap-scripts.md

### Overview

- 双方向 WebDriver プロトコルに基づく新機能である Bootstrap Scripts
- Bootstrap Scripts は、新しいスクリプト実行コンテキストが作成されるたびに一度だけ実行
  - そのコンテキスト内の他のスクリプトよりも先に実行されることが保証される関数
- ページ、ワーカーサービスワーカーと同じスクリプトコンテキストで実行されるため、コンテキスト内の変数を検査、操作して、DOM と対応したり、API をポリフィルしたりすることができる
- Bootstrap Scripts が WebDriver クライアントと通信できるようにするための messaging channel が提供

### Motivation

- WebDriver にはページによって生成されるイベントをリッスンしたり、継続的な通知を受け取る簡単な方法がない
- 他のスクリプトより先に実行が保証される仕組みもない
- 簡単な例として、ブートストラップスクリプトを使用してページ上に「DOMContentLoaded」イベントリスナーを登録し、「DOMContentLoaded」イベントが発生したときに WebDriver クライアントに通知を送信することが考えられます。これにより、クライアントにテストの準備が整ったことを知らせることができる
  - この例ではシングルページアプリケーションが UI コンテンツを非同期にロードする場合、「DOMContentLoaded」や「load」イベントだけではアプリが安定した状態にあり、テストの準備が整っていることを示すには不十分かもしれない
  - アプリが UI が完全にロードされたことをテストコードに知らせる方法があれば、テストコードはこのイベントをリッスンしてからテストを進めることができます。これは、タイムアウトや DOM のポーリングよりも信頼性が高く効率的
  - これが WebDriver BiDi ならできるよ
- 別のユースケース
  - console.log 関数をカスタム実装してロギング
  - PerformanceObserver を作成し、メッセージングチャネルを使用してパフォーマンスエントリをクライアントに転送する

### Registering Bootstrap Scripts

- WebDriver BiDi プロトコルは、3 種類のスクリプトコンテキストを定義しています: 「document」、「worker」、および「serviceWorker」
- 各スクリプトコンテキストには一意の ID がある
- WebDriver クライアントではスクリプトコンテキストの ID を知る前に、Bootstrap Scripts を登録する
- example.com に属するすべてのスクリプトコンテキストに Bootstrap Scripts を登録するなどマッチパターンを使用する

```json
{
  "id": 99,
  "method": "registerBootstrapScript",
  "params": {
    "match": [{ "type": "document", "urlPattern": "http://example.com/*" }],
    "script": "... script text to execute here ..."
  }
}
```

- match パラメータはスクリプトを実行すべきコンテキストを記述するルールの配列
- レスポンスは以下

```json
{
  "id": 99,
  "result": { "bootstrapScriptId": "<ID>" }
}
```

- この ID はスクリプトの特定のインスタンスを表しているわけではなく、登録を表している

マッチパターン

- type - 列挙型
  - "document": DOM にアクセスできるスクリプトコンテキスト。
  - "worker": ウェブワーカーコンテキスト。
  - "serviceWorker": サービスワーカーコンテキスト。
- urlPattern - URL をマッチさせるための正規表現文字列。
  - "document"タイプの場合、関連するブラウジングコンテキストの現在の URL がチェックされます。
  - "worker"または"serviceWorker"タイプの場合、初期スクリプトの URL がチェックされます。

```json
{ "type": "serviceWorker", "urlPattern": "https://mdn.github.io/sw-test/sw.js" }
{ "type": "document", "urlPattern": "*://bing.com/*" }
```

### Messaging

- Bootstrap Scripts は WebDriver クライアントと双方向通信する必要がある
  - テスト自動化コードとテストページ間の調整やタイミングの管理
  - ページがアクセスできない操作をクライアントに依頼
  - DOM イベントをクライアントに転送
- このシナリオを可能にするため、Bootstrap Scripts が特定のスクリプトコンテキストと一致した時に知る方法が必要
- bootstrapScriptId と scriptContextId を使用して、特定のスクリプトコンテキストにメッセージをルーティングできます。この情報はイベントを通じて提供可能

```json
{
  "method": "bootstrapScriptExecuted",
  "params": { "bootstrapScriptId": "<ID>", "scriptContextId": "<ID>" }
}
```

- このイベントをリッスンし、Bootstrap Scripts が実行されたときと、メッセージを送信する方法を追跡できる
