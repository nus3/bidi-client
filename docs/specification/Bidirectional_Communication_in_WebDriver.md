# chromedriver チームの draft design

https://docs.google.com/document/d/1eJx437A9vKyngOQ49lYYD3GspDUwZ6KpKDgcE2eR00g/edit?tab=t.0#heading=h.o2rs2j1xgnlm

## GPT による翻訳

WebDriver における双方向通信: ChromeDriver プロトタイプ

この文書は、元々 Julian Kung によって書かれた Google の内部設計文書に基づいています。この文書に基づいたプロトタイプが ChromeDriver で実装されています。

目的

ChromeDriver は、クライアントが Chrome の DevTools プロトコルにアクセスし、簡単に操作できる手段を提供する機能を提供します。この機能の目的は二つあります。主な目標は、クライアントが Chromedriver を使用して DevTools と完全に通信できるようにすることです。しかし、より大きな意味では、この ChromeDriver の機能は、DevTools とのインタラクションのための WebDriver 標準を先駆けることを意図しています。

目標

ChromeDriver を通じてクライアントと DevTools 間の双方向通信を可能にする機能を作成する
DevTools とのインタラクションのための WebDriver 標準を促進する

背景

現在の ChromeDriver の概要

ChromeDriver は、WebSocket 接続を通じて DevTools/Chrome と通信し、Chrome と ChromeDriver 間で双方向のメッセージベースの通信を可能にしています。このような接続により、ChromeDriver は DevTools によって発生するイベントをリアルタイムでリッスンし、受信し、応答することができます。これに対して、クライアントは HTTP を介して WebDriver REST プロトコルを使用して ChromeDriver と通信します。HTTP のリクエスト-レスポンスの性質により、DevTools からのイベントをクライアントにリアルタイムで配信することはできません。現在の製品では、ChromeDriver はクライアントが ChromeDriver を通じて DevTools にコマンドを送信することをネイティブにサポートしていますが、クライアントがリアルタイムで発生するイベントをリッスンし応答するためのメカニズムは提供していません。この機能が解決できる具体的な例として、基本認証があります。基本認証は現在、ChromeDriver ではサポートされていません。しかし、DevTools は Fetch ドメインを通じて基本認証をサポートしています。クライアントは DevTools の Fetch ドメインを購読することができ、クライアントが Fetch.authRequired イベント（基本認証ポップアップ要求を示す）を受信したときに、適切な認証情報を使用して Fetch.continueWithAuth コマンドを送信することでそれを処理することができます。

レイアウトの概要

関連する ChromeDriver アーキテクチャの簡略化された図は以下に示されています。

ChromeDriver によって公式にサポートされているわけではありませんが、クライアントは ChromeDriver と並行して DevTools に直接 WebSocket 接続を確立することで、DevTools のイベントをリアルタイムで受信することができます。

現在の制限事項

ChromeDriver は、クライアントが DevTools と対話することをサポートしていません。
クライアントによって使用される現在の回避策は、クライアントと ChromeDriver の間に競合状態を引き起こします。これは、並行する WebSocket 接続が存在するためです。
クライアントによって使用される現在の回避策は、プロセス外の iframe（OOPIF）にコマンドを送信する際の複雑なロジックを露呈します。
OOPIF にコマンドを送信するには、OOPIF を含むトップレベルページへの接続と、OOPIF のターゲット ID の両方が必要です。
ChromeDriver はすでにこのロジックを正しく処理していますが、クライアントがこれを正しく実装するのは難しく、労力がかかります。

提案

詳細設計

提案された実装は、高レベルではクライアントと ChromeDriver の間に WebSocket 接続を確立することを中心にしており、ChromeDriver がクライアントと DevTools 間の通信を促進する仲介者として機能することを可能にします。クライアントが ChromeDriver と WebSocket 接続を確立すると、HttpServer::OnWebSocketRequest 関数が呼び出されます。同様に、クライアントが WebSocket 接続を通じて ChromeDriver にメッセージを送信すると、HttpServer::OnWebSocketMessage 関数が呼び出されます。現在、これらの関数が呼び出されたときに ChromeDriver は何もしません。この提案は、双方向通信をサポートするために両方のメソッドの機能を拡張します。

DevToolsHttpClients はさらに、ChromeDriver からクライアントに WebSocket メッセージを送信するために必要なすべての情報を持つプライベートな ClientWebSocketConnection オブジェクトを保持します。DevToolsHttpClient が DevToolsClient を作成するたびに、ClientWebSocketConnection へのポインタも渡されます。このポインタは DevToolClient の SyncWebSocket に保存されます。DevToolClient の SyncWebSocket が DevTools からメッセージを受信すると、そのメッセージを解読して処理すべきかどうかを決定します。

HttpServer::OnWebSocketRequest

クライアントが WebSocket 接続を確立すると、ChromeDriver はその接続が有効であれば受け入れます。その後、そのセッションの DevToolsHttpClient 内の ClientWebSocketConnection が、ChromeDriver がその特定の WebSocket 接続を通じて情報を送信するために必要な情報で満たされます。ClientWebSocketConnection には SendToClient という関数があり、std::string メッセージを受け取り、WebSocket 接続を通じてクライアントに送信します。

HttpServer::OnWebSocketMessage

ChromeDriver がクライアントから送信されたデータを受信すると、そのデータを DevTools に直接転送することをクライアントが望んでいると仮定されます。この関数は、ChromeDriver の DevToolsClient::SendCommandInternal を通じてデータを渡し、OOPIFs に関する問題を処理します。データは、SyncWebSocket がコマンドから作成された DevTools の応答を ChromeDriver ではなくクライアントに転送するように印を付けられます。この印は負の ID の形をとります（ChromeDriver は正の ID を使用します）。クライアントは使用する負の ID を提供し、追跡する責任があります。クライアントが負の ID を提供しない場合、エラーがスローされます。

クライアント → DevTools

クライアントがこの WebSocket 接続を通じて送信するデータはすべて、DevTools に転送されます。このプロセスは、上記の HttpServer::OnWebSocketMessage セクションに記載されています。

制限事項:

クライアントは、アクティブな DevTools クライアントの範囲外の DevTools イベントをリッスンすることができません。

例えば、クライアントがタブ 1 とタブ 2 を開いており、タブ 1 がアクティブウィンドウである場合、クライアントはタブ 1 から発生するイベントのみを受信し、タブ 2 から発生するイベントは受信しません。
ユーザーは、ChromeDriver セッションごとに単一の WebSocket 接続に制限されます。この制限を回避するために、ユーザーは DevTools に直接接続することを選択できますが、ChromeDriver はこれをサポートする予定はありません。

クライアントが ChromeDriver で使用されるドメイン（例えば、Page ドメイン）を無効にすると、ChromeDriver は動作しなくなります。

代わりに、実際にドメインを無効にするのではなく、そのドメインに関連するイベントを送信しないようにすることもできます。
なお、ChromeDriver クライアントはすでにこの方法で ChromeDriver を意図的に壊すことができますが、現在のところクライアントがこれを行う理由はありません。
クライアントは、開いた各タブごとに DevTools の関心のあるすべてのドメインを再度購読する必要があります。

例えば、単一のアクティブなタブ（タブ 1）を持つクライアントが、コマンド「Fetch.enable」を通じて Fetch ドメインを有効にし、新しいタブ（タブ 2）を開くと、タブ 2 では Fetch ドメインは無効のままとなります。タブ 2 をアクティブウィンドウにしてコマンド「Fetch.enable」を送信しない限り、Fetch ドメインは有効になりません。以下に擬似コードを示します。

```js
tab1 = chromedriver.get_active_window()
chromedriver.send_command("Fetch.enable", {}) # タブ1でFetchドメインが有効

tab2 = chromedriver.new_window()
chromedriver.switch_to_window(tab2) # タブ2ではFetchドメインが無効

chromedriver.send_command("Fetch.enable", {}) # タブ2でFetchドメインを有効にする

chromedriver.switch_to_window(tab1) # タブ1ではFetchドメインがすでに有効
```

同様に、クライアントがタブ 1 とタブ 2 を開いており、タブ 1 がアクティブウィンドウで、クライアントがタブ 1 で Fetch ドメインを有効にした場合、Fetch ドメインは明示的に有効にしない限りタブ 2 では無効のままとなります。以下に擬似コードを示します。

```js
tab1 = chromedriver.get_active_window()
tab2 = chromedriver.new_window()

# タブ1がまだアクティブウィンドウ
chromedriver.send_command("Fetch.enable", {}) # タブ1でFetchドメインが有効

chromedriver.switch_to_window(tab2) # タブ2ではFetchドメインが無効
```

検討された代替案

代替案 1: ChromeDriver がコマンドを実行するために現在使用している targetID を返す API エンドポイントを提供することが検討されました。これにより、クライアントは DevTools セッションを並行して実行し、ChromeDriver と同じフレームに対してコマンドを送受信することができます。

利点:

このソリューションの最大の利点は、クライアントがアクティブなタブだけに制限されなくなることです。
クライアントがタブ 1 とタブ 2 を開いており、タブ 2 がアクティブウィンドウである場合、クライアントはタブ 1 から発生するイベントをリッスンすることを選択できます。
欠点/制限:

クライアントは OOPIFs（プロセス外の iframe）を扱う必要があります。クライアントは、OOPIF にコマンドを送信するために親の TargetID を問い合わせる必要があります。Chrome の OOPIF 実装は他のブラウザベンダーによって Chrome 固有と見なされており、標準化されていません。
より多くの WebSocket 接続を確立する必要があります。
提案されたソリューションは単一の WebSocket 接続を追加しますが、この代替案はクライアントが関心を持つすべてのウィンドウに対して単一の WebSocket 接続を追加します。
並行する DevTools セッションによる競合状態の存在
同じ DevTools ウィンドウに対して複数の WebSocket 接続が行われるため、クライアントと ChromeDriver の間で競合状態が発生する可能性があります。
代替案 2: 提案されたソリューションのように WebSocket 接続を確立するが、新しい DevToolsEventListener がすべての適切な DevTools データをクライアントに送信する責任を持つようにすることが検討されました。このソリューションは、以前に挙げた制限の大部分を解決します。クライアントと Chrome の間の競合状態の存在は最小限に抑えられます。なぜなら、DevTools は単一の DevToolsClient からのコマンドをリッスンするからです。また、クライアントの OOPIFs との対話も最小限に抑えられます。この方法の主な欠点は、DevToolsEventListeners がセッションスレッドを通じて処理されるため、クライアントはリアルタイムでイベントを受信するのではなく、ChromeDriver がコマンドを実行した後にのみイベントを受信することです。

利点:

背景で挙げられた関連する制限の大部分を解決します。
クライアントの OOPIFs との対話を最小限に抑えます。
欠点:

リアルタイムではありません。この制限を示す例を以下に示します。

```js
socket = chromedriver.create_socket_connection()
socket.send({'command': 'Page.Navigate', 'url': 'https://www.google.com'})

# Page.loadEventFiredイベントを受信したら、ボタンをクリック
while True:
  # DevToolsListenerがDevToolsによって発生したイベントを処理するためのChromeDriver関数が呼び出されないため、
  # ソケットはデータを受信しません
  event_received = socket.recv()
  if event_received == 'Page.loadEventFired':
     chromedriver.findElementById("foo").click()
     break

print("Clicked on button")

# したがって、実行はループで停止し、printは実行されません
```

クライアント接続

この設計文書は、ChromeDriver を通じてクライアントと DevTools 間の双方向通信を確立するためのメカニズムを提供する機能を中心にしていますが、クライアント側の WebSocket 接続の実装詳細は意図的に省略されています。このトピックは設計文書の範囲外と見なされ、テストクライアントが適切に実装する責任があります。

## GPT による要約

WebDriver における双方向通信: ChromeDriver プロトタイプ

目的と目標:

ChromeDriver がクライアントと DevTools 間の双方向通信を可能にする機能を提供し、DevTools とのインタラクションのための WebDriver 標準を促進することを目指しています。
背景:

現在、ChromeDriver は WebSocket 接続を通じて DevTools と通信しますが、クライアントは HTTP を介して ChromeDriver と通信しているため、リアルタイムでのイベント受信ができません。
基本認証のような機能は、DevTools の Fetch ドメインを利用することで解決可能です。
提案された実装:

クライアントと ChromeDriver の間に WebSocket 接続を確立し、ChromeDriver がクライアントと DevTools 間の通信を仲介します。
HttpServer::OnWebSocketRequest と HttpServer::OnWebSocketMessage を拡張して、双方向通信をサポートします。
現在の制限事項:

クライアントはアクティブな DevTools クライアントの範囲外のイベントをリッスンできません。
単一の WebSocket 接続に制限され、OOPIFs の処理が必要です。
各タブごとに DevTools のドメインを再度購読する必要があります。
検討された代替案:

targetID を返す API エンドポイントを提供する案や、新しい DevToolsEventListener を使用する案が検討されましたが、それぞれに利点と欠点があります。
クライアント接続:

クライアント側の WebSocket 接続の実装は設計文書の範囲外であり、テストクライアントが適切に実装する責任があります。
