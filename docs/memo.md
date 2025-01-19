## WebDriver BiDi の利点

https://github.com/lana-20/selenium-webdriver-bidi

## WebDriver BiDi の実装状況

https://wpt.fyi/results/webdriver/tests/bidi?label=master&label=experimental&aligned&q=tests%2Fbidi

- firefox が CDP を deprecated して、WebDriver BiDi に移行している
  - https://fxdx.dev/deprecating-cdp-support-in-firefox-embracing-the-future-with-webdriver-bidi/
  - 2024 年末には CDP サポートを完全に削除する予定
- Puppeteer の v23 から Firefox 上では BiDi プロトコルがデフォルトで使われるように
  - https://hacks.mozilla.org/2024/08/puppeteer-support-for-firefox/
- WebKit では Igalia が推進
  - https://people.igalia.com/lmoura/wkcm-2024/webdriver-bidi-webkit.html
- playwright の BiDi 対応
  - https://github.com/microsoft/playwright/issues/32577
  - 内部で実装を試しながらテスト中
  - playwright では他ブラウザへの対応はパッチを当てている
    - https://github.com/microsoft/playwright/tree/main/browser_patches
- Selenium
  - https://www.selenium.dev/documentation/webdriver/bidi/
  - CDP のコマンドを置き換える実装が進んでいる
- WebDriver IO では v9 から BiDi プロトコルを使うのがデフォルトに
  - https://webdriver.io/blog/2024/08/15/webdriverio-v9-release/

## 従来の WebDriver

- ChromeDriver
  - https://docs.google.com/document/d/1eJx437A9vKyngOQ49lYYD3GspDUwZ6KpKDgcE2eR00g/edit?tab=t.0
  - Devtools と ChromeDriver 間では WebSocket を通じて双方向通信が可能だったが
  - クライアントは HTTP を介して、WebDriver REST プロトコルを使用して ChromeDriver と通信していた
  - クライアントがリアルタイムで発生するイベントを受け取る仕組みがなかった
- 他 Driver も同様にブラウザと Driver 間は HTTP プロトコルを介して、ブラウザの自動化が行われていた
  - https://www.neovasolutions.com/2022/05/19/browser-automation-tools-protocols-webdriver-vs-cdp/
  - 1 方向通信は不安定さがある
  - イベントをリッスンするには、ポーリングが必要
    - 以下の motivation に関連の記載がある
    - https://github.com/w3c/webdriver-bidi/blob/main/proposals/bootstrap-scripts.md

## テスト自動化の進化

https://developer.chrome.com/blog/test-automation-evolution?hl=ja

- テスト自動化が現実のものとなったのは 2000 年代
  - クロスブラウザ、マルチデバイスに対応するため、Selenium と WebDriver プロジェクトが登場
- 2011 年に Selenium WebDriver として統合
- 2018 年に W3C 標準になった
- 通常、WebDriver or WebDriver Classic と呼ばれる
- 2011 年以降、WebdriverIO、Appium、Nightwatch、Protractor（非推奨）、Testcafe、Cypress、Puppeteer、Playwright などの新しい自動化ソリューションが登場
- 自動化のアプローチは大きく二つに分類された
  - ブラウザ内で JS を実行するツール
    - Selenium の最初のバージョン、Cypress、TestCafe
  - ブラウザ外でリモートコマンドを実行する方法
    - WebDriver Classic、CDP
- WebDriver Classic は HTTP を介して、Driver にコマンドを送信するので、速度が遅く、低レベルコントロールをサポートしていない
- CDP は WebSocket を介して双方向通信を行い、高速なパフォーマンスと低レベルのコントロールが可能
  - しかし Chromium ベースのブラウザでのみ動作し、標準ではない
- 低レベルのコントロール
  - console のキャプチャ、ネットワークリクエストのインターセプト、デバイスモードのシミュレートなど
- WebDriver Classic ではブラウザイベントの登録とリッスンが困難

### WebDriver BiDi クロスブラウザ自動化の未来

https://developer.chrome.com/blog/webdriver-bidi?hl=ja

- WebDriver BiDi はさまざまなブラウザベンダ、オープンソースのブラウザ自動化プロジェクト、ブラウザ自動化ソリューションを提供する企業で構成された[Browser Testing and Tools Working Group](https://www.w3.org/groups/wg/browser-tools-testing/)が仕様を策定している
  - https://developer.chrome.com/blog/webdriver-bidi?hl=ja#standardization
- CDP は Chromium ベースのブラウザで、デバッグ目的で CDP を使う
  - WebDriver BiDi はテストのニーズに対応するための新しい仕様という位置付け

## Chrome DevTools Protocol

https://chromedevtools.github.io/devtools-protocol/

- CDP を使う方法
  - https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md
  - firefox と同様にブラウザ起動時に`--remote-debugging-port=0`を渡すことで WebSocket での接続先を用意してくれる

## Web Inspector Protocol?

CDP 相当のものが Safari にもあるのか

- WebKit Remote Debugging Protocol?
  - https://blogs.igalia.com/dpino/2015/12/31/Architecture-of-the-Web-Inspector/
  - WebSocket を使った双方向通信が可能そう
- Safari で WebDriver に対応した話
  - https://webkit.org/blog/6900/webdriver-support-in-safari-10/
- Playwright での WebKit 対応について
  - https://playwright.dev/docs/browsers#webkit

## memo

- WebDriver BiDi は WebDriver を基盤として拡張された、ブラウザ自動化のための双方向プロトコル
  - https://github.com/w3c/webdriver-bidi/blob/main/README.md
- コマンドの考え方はここらへん持ってくれば良さそう
  - https://github.com/w3c/webdriver-bidi/blob/main/proposals/core.md#commands
- WebDriver BiDi 仕様策定のロードマップ
  - https://github.com/w3c/webdriver-bidi/blob/main/roadmap.md
- examples を実装してみても良さそう
  - https://github.com/w3c/webdriver-bidi/blob/main/proposals/core.md#examples
- bootstrap scripts は prelaodScript で実装されそう？
  - https://www.w3.org/TR/webdriver-bidi/#command-script-addPreloadScript
- CDP はブラウザバージョンと整合性を取るのが大変？的な記載があったような
  - https://docs.google.com/document/d/1dCd8Y2PYaR5mOGSmNTwllEHNmFqegfoGkP-TCKvPzSU/edit?tab=t.0#heading=h.z28d63ia672d
- Firefox での CDP つらかった話
  - https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi?hl=ja
  - Mozilla では Firefox に CDP のサブセットを実装し、メンテナンスしていたが
  - CDP は Chrome の Devtools 用のもので、Devtools の要件に合わせて変更する必要があった
  - CDP は標準化されておらず、コミュニケーションが大変だった
  - だから[Browser Testing and Tools Working Group](https://www.w3.org/groups/wg/browser-tools-testing/)（他の主要なブラウザベンダやツールベンダ）と共に WebDriver BiDi を作成した
- puppeteer は Safari をサポートしていない
  - https://pptr.dev/supported-browsers

## TODO

- Playwright はどのようにして WebKit 対応しているのか
  - https://github.com/microsoft/playwright/tree/main/browser_patches
