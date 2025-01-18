# BiDi の経緯

- Browser Testing and Tools working Group は、[TPAC 2019](https://www.w3.org/wiki/Webdriver/2019-TPAC) で WebDriver での双方向通信について議論した
  - chromedriver チームがクライアントと双方向に通信できる設計を共有
-

## TPAC 2019 ワーキング グループ ミーティング

- 2019 TPAC のアジェンダとして以下がある
  - Bidirectional communication and overlap with CDP
  - 双方向通信と CDP との重複
  - https://docs.google.com/document/d/1gUm7Be-akW2-4mjr15cnZlzwoAfOlfL7b3tWCDrb1Jg/edit?tab=t.0
  - ここで chromedriver チームが draft design を書いてプロトタイプ実装を進めている旨が記載されている
    - https://docs.google.com/document/d/1eJx437A9vKyngOQ49lYYD3GspDUwZ6KpKDgcE2eR00g/edit?tab=t.0#heading=h.o2rs2j1xgnlm

### chromedriver チームの draft design

https://docs.google.com/document/d/1eJx437A9vKyngOQ49lYYD3GspDUwZ6KpKDgcE2eR00g/edit?tab=t.0#heading=h.o2rs2j1xgnlm

- 目的
  - ChromeDriver では、クライアントが接続と操作するための CDP(Chrome Devtools Protocol)がある
    - 主に DevTools と完全に通信できるようにすることが目標だったが、大きな意味では ChromeDriver の機能は DevTools とのインタラクションのための WebDriver 標準を先導することを意図している
    - 目標としてはクライアントと DevTools 間の双方向通信を可能にし、WebDriver 標準を促進する
- 背景
  - Chrome と ChromeDriver 間では双方向のメッセージベースの通信が可能
    - しかしクライアントは HTTP を介して、ChromeDriver と通信する
    - HTTP のリクエスト、レスポンスの性質により、クライアントと ChromeDriver 間でリアルタイムにやりとりができない
- レイアウト
  - クライアントと DevTools で直接 WebSocket 接続を確立することで、DevTools のイベントをリアルタイムで受信できる
- 提案

## WebDriver/2019-05-BiDi

https://www.w3.org/wiki/WebDriver/2019-05-BiDi

- spec のリポジトリを作ったのがこの会議周辺っぽい
  - Spec organisation proposal (https://github.com/jgraham/webdriver-bidi created, using Bikeshed)

## 雑 memo

- 最初の方の issue
  - https://github.com/w3c/webdriver-bidi/issues/15
- 2020 年の MTG の議事録
  - https://docs.google.com/document/d/1qZcT2RBdmxbzVorV1hTUaH_sIvrhGYjZbP4rK0IpBEc/edit?tab=t.0#bookmark=id.tu7bmxwhyaem
  - GPT による要約
    - Microsoft、Apple、Mozilla、Google などの主要なブラウザベンダーやツール開発者が参加し、クロスブラウザテストの標準化や WebDriver と Puppeteer のギャップを埋めることを目的
- w3c の WebDriverBiDi の議事録はここら辺から確認できそう？
  - https://www.w3.org/wiki/WebDriver
- togami さんのまとめ
  - https://zenn.dev/togami2864/articles/65af759b4a34f6
- explainer に概要が記載されてる
  - Bidirectional WebDriver Protocol
    - https://github.com/w3c/webdriver-bidi/blob/main/explainer.md
  - TPAC 2019 ワーキング グループ ミーティングが起源？
- proposals 見れば、提案内容とかも把握できそう？
- WebDriver BiDi は
