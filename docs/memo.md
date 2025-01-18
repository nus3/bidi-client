## WebDriver BiDi の利点

https://github.com/lana-20/selenium-webdriver-bidi

## WebDriver BiDi の実装状況

https://wpt.fyi/results/webdriver/tests/bidi?label=master&label=experimental&aligned&q=tests%2Fbidi

- firefox が CDP を deprecated して、WebDriver BiDi に移行している
  - https://fxdx.dev/deprecating-cdp-support-in-firefox-embracing-the-future-with-webdriver-bidi/
- WebKit では Igalia が推進
  - https://people.igalia.com/lmoura/wkcm-2024/webdriver-bidi-webkit.html
- playwright の BiDi 対応
  - https://github.com/microsoft/playwright/issues/32577

## memo

- WebDriver BiDi は WebDriver を基盤として拡張された、ブラウザ自動化のための双方向プロトコル
  - https://github.com/w3c/webdriver-bidi/blob/main/README.md
- コマンドの考え方はここらへん持ってくれば良さそう
  - https://github.com/w3c/webdriver-bidi/blob/main/proposals/core.md#commands
- WebDriver BiDi 仕様策定のロードマップ
  - https://github.com/w3c/webdriver-bidi/blob/main/roadmap.md
- examples を実装してみても良さそう
  - https://github.com/w3c/webdriver-bidi/blob/main/proposals/core.md#examples

## TODO

- event
  - targetCreated イベントを使い、新しいウィンドウが作成されたのを検知する
- エラーハンドリング時にセッションを cleanup しきれてなさそうなので、その修正
- bidi の仕様の起源を調べる
- 以下の Bootstrap Scripts の翻訳の続きから
  - https://github.com/w3c/webdriver-bidi/blob/main/proposals/bootstrap-scripts.md#webdriver-client-side
