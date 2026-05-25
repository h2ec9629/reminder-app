// ===== IT QUIZ =====

const QUIZ_CMT = {
  start:   ['10問、気合い入れてください！','全問正解したら褒めてあげますわ','わたしが作った問題ですから難しいですよ'],
  correct: ['正解！やりますやんか〜！','そうですそうです、合ってます！','おー！正解ですわ！'],
  wrong:   ['あー惜しい！これは覚えといてください','違いますわ〜。これ大事なやつですよ','ブー！でも覚えたら強くなれますわ'],
  perfect: ['満点！信じられへん…本当にすごいですわ！','全問正解！わたしより詳しいんちゃいますか','パーフェクト！すごすぎて言葉出てきませんわ'],
  great:   ['めっちゃ優秀やないですか！','すごいですわ〜！わたし負けそう','これだけ取れたら十分合格圏ですわ'],
  good:    ['まあまあですわ。もう少し頑張りましょ','7割超えてますし、悪くないですよ','もうちょっとで全問正解ですわね'],
  normal:  ['んー、もうちょい勉強しましょ','半分以上は取れましたね！次は改善できますよ','まだまだ伸びしろありますわ'],
  bad:     ['もしかして初めて聞く言葉多かったですか？','ドンマイです！次こそ頑張りましょ','これを機に覚えていきましょか！'],
};
function quizCmt(key){ const p=QUIZ_CMT[key]; return p[Math.floor(Math.random()*p.length)]; }

const QUIZ_QUESTIONS = [
  // ===== IT一般・略語 =====
  {q:'CPUとは何の略ですか？',choices:['Central Processing Unit','Computer Power Unit','Core Processing Utility','Central Power Unit'],a:0,cat:'IT一般'},
  {q:'RAMとは何の略ですか？',choices:['Random Access Memory','Read And Modify','Rapid Action Module','Read Access Memory'],a:0,cat:'IT一般'},
  {q:'ROMとは何の略ですか？',choices:['Read Only Memory','Random Order Memory','Remote Operating Mode','Read Or Modify'],a:0,cat:'IT一般'},
  {q:'USBとは何の略ですか？',choices:['Universal Serial Bus','Unified System Board','Ultra Speed Bridge','Universal Storage Box'],a:0,cat:'IT一般'},
  {q:'PDFとは何の略ですか？',choices:['Portable Document Format','Print Data File','Page Display Format','Public Document Frame'],a:0,cat:'IT一般'},
  {q:'HTMLとは何の略ですか？',choices:['HyperText Markup Language','High Transfer Media Link','Hyper Terminal Monitor Layer','Home Text Machine Language'],a:0,cat:'IT一般'},
  {q:'URLとは何の略ですか？',choices:['Uniform Resource Locator','Universal Read Link','Unified Remote Location','User Reference Layer'],a:0,cat:'IT一般'},
  {q:'OSとは何の略ですか？',choices:['Operating System','Output System','Organize Software','Online Server'],a:0,cat:'IT一般'},
  {q:'GUIとは何の略ですか？',choices:['Graphical User Interface','General Utility Instruction','Global Unified Input','Grid User Integration'],a:0,cat:'IT一般'},
  {q:'APIとは何の略ですか？',choices:['Application Programming Interface','Advanced Processing Integration','Automated Program Index','Application Process Input'],a:0,cat:'IT一般'},
  {q:'SSHとは何の略ですか？',choices:['Secure Shell','Super Speed Host','System Security Hub','Simple Sync Handler'],a:0,cat:'IT一般'},
  {q:'SSDとは何の略ですか？',choices:['Solid State Drive','Super Speed Disk','Static Storage Device','Secure Sync Drive'],a:0,cat:'IT一般'},
  {q:'QRコードのQRとは何の略ですか？',choices:['Quick Response','Quality Record','Queue Register','Quick Read'],a:0,cat:'IT一般'},
  {q:'AIとは何の略ですか？',choices:['Artificial Intelligence','Automated Integration','Advanced Input','Analog Interface'],a:0,cat:'IT一般'},
  {q:'IoTとは何の略ですか？',choices:['Internet of Things','Integration of Technology','Input on Terminal','Internet of Transfer'],a:0,cat:'IT一般'},
  {q:'CSSとは何の略ですか？',choices:['Cascading Style Sheets','Computer Style System','Content Structure Sheet','Central Style Source'],a:0,cat:'IT一般'},
  {q:'VBAとは何の略ですか？（ExcelのVBA）',choices:['Visual Basic for Applications','Virtual Boot Architecture','Variable Build Array','Visual Binary Access'],a:0,cat:'IT一般'},
  {q:'HTTPSのSは何を意味しますか？',choices:['Secure','System','Server','Sync'],a:0,cat:'IT一般'},
  {q:'1KBは何バイトですか？',choices:['1024バイト','1000バイト','512バイト','2048バイト'],a:0,cat:'IT一般'},
  {q:'1GBは何MBですか？',choices:['1024MB','1000MB','512MB','2048MB'],a:0,cat:'IT一般'},
  {q:'2進数の「1010」は10進数でいくつですか？',choices:['10','8','12','14'],a:0,cat:'IT一般'},
  {q:'16進数の「FF」は10進数でいくつですか？',choices:['255','256','254','128'],a:0,cat:'IT一般'},
  {q:'「デバッグ」とは何ですか？',choices:['プログラムの不具合を見つけて修正すること','プログラムを高速化すること','プログラムをコンパイルすること','プログラムを削除すること'],a:0,cat:'IT一般'},
  {q:'「コンパイル」とは何ですか？',choices:['人間が書いたコードを機械語に変換すること','プログラムを実行すること','データを暗号化すること','ファイルを圧縮すること'],a:0,cat:'IT一般'},
  {q:'「アルゴリズム」とは何ですか？',choices:['問題を解くための手順・計算方法','プログラムの設計図','コンピュータの処理速度','データの保存形式'],a:0,cat:'IT一般'},
  {q:'「クラウドコンピューティング」とはどれですか？',choices:['インターネット経由でコンピュータ資源を利用するサービス','雲型のサーバー装置','オフライン専用のシステム','特定企業向けの内部ネットワーク'],a:0,cat:'IT一般'},
  {q:'「サーバー」の役割として正しいのはどれですか？',choices:['他のコンピュータにサービスや資源を提供する','インターネットに接続するための装置','データを入力するための機器','画面を表示するための装置'],a:0,cat:'IT一般'},
  {q:'「クライアント」とは何ですか？',choices:['サーバーからサービスを受け取るコンピュータや端末','データを保管するコンピュータ','ネットワークを管理するコンピュータ','プログラムを開発するためのソフト'],a:0,cat:'IT一般'},
  {q:'「プロトコル」とは何ですか？',choices:['通信の規約・手順の取り決め','コンピュータの処理能力','ソフトウェアの設計書','ネットワークの物理的な配線'],a:0,cat:'IT一般'},
  {q:'XMLとは何の略ですか？',choices:['eXtensible Markup Language','Extra Module Link','Extended Memory Layout','Executable Machine Language'],a:0,cat:'IT一般'},
  {q:'JSONとは何の略ですか？',choices:['JavaScript Object Notation','Java Secure Object Node','Joint Software Open Network','Java Standard Output Null'],a:0,cat:'IT一般'},
  {q:'「キャッシュ」とは何ですか？',choices:['よく使うデータを一時的に保存して高速化する仕組み','不要なファイルを削除する機能','パスワードを暗号化する機能','データをバックアップする機能'],a:0,cat:'IT一般'},
  {q:'「ストリーミング」とは何ですか？',choices:['ダウンロードしながら同時に再生する技術','映像を高画質に変換する技術','インターネットを高速化する技術','動画を圧縮する技術'],a:0,cat:'IT一般'},
  {q:'「クッキー（Cookie）」とは何ですか？',choices:['ウェブサイトがブラウザに保存する小さなデータ','ウイルスの一種','ウェブページのデザインを決めるファイル','動画配信の形式'],a:0,cat:'IT一般'},
  {q:'「レスポンシブデザイン」とは何ですか？',choices:['画面サイズに応じてレイアウトが変わる設計','応答速度が速いウェブサイトの設計','セキュリティを強化したウェブ設計','オフラインでも動くウェブ設計'],a:0,cat:'IT一般'},
  {q:'「UI」とは何の略ですか？',choices:['User Interface','Unified Input','Universal Integration','User Information'],a:0,cat:'IT一般'},
  {q:'「UX」とは何の略ですか？',choices:['User Experience','Unified Execution','User Extension','Ultra Exchange'],a:0,cat:'IT一般'},
  {q:'「オープンソース」とは何ですか？',choices:['ソースコードが公開されており誰でも使用・改変できるソフトウェア','無料で使えるソフトウェア全般','インターネットに接続できるソフトウェア','クラウドで動くソフトウェア'],a:0,cat:'IT一般'},
  {q:'「仮想マシン（VM）」とは何ですか？',choices:['ソフトウェアで実現した仮想的なコンピュータ','遠隔操作できるパソコン','クラウド上に置くファイルサーバー','ゲーム用の高性能パソコン'],a:0,cat:'IT一般'},
  {q:'「ビッグデータ」とは何ですか？',choices:['従来の方法では処理困難な大量・多様・高速なデータ群','1TB以上のデータ','企業の売上データ','政府が管理する統計データ'],a:0,cat:'IT一般'},
  {q:'FTPとは何の略ですか？',choices:['File Transfer Protocol','Fast Transfer Process','Frame Transfer Port','File Transmission Path'],a:0,cat:'IT一般'},
  {q:'「バックアップ」とは何ですか？',choices:['データの消失に備えてコピーを別に保存すること','不要なファイルを削除すること','ソフトウェアをアップデートすること','システムを再起動すること'],a:0,cat:'IT一般'},
  {q:'「マルチタスク」とは何ですか？',choices:['複数の作業を同時に（または短時間で切り替えて）処理すること','高性能なCPUのこと','複数のユーザーが使えるシステム','複数の画面に表示できる機能'],a:0,cat:'IT一般'},
  {q:'「フォント」とは何ですか？',choices:['文字の書体・デザインのセット','画像の解像度単位','印刷の用紙サイズ','カーソルの形状'],a:0,cat:'IT一般'},
  {q:'「解像度」とは何ですか？',choices:['画像の細かさを表す単位（ピクセル数）','画面の明るさ','ファイルの容量','色の深さ'],a:0,cat:'IT一般'},
  {q:'「インストール」とは何ですか？',choices:['ソフトウェアをコンピュータに組み込んで使える状態にすること','ソフトウェアを削除すること','ソフトウェアを起動すること','ソフトウェアを更新すること'],a:0,cat:'IT一般'},
  {q:'「ドライバー」（ソフトウェア）とは何ですか？',choices:['ハードウェアをOSから操作するためのソフトウェア','ウイルス対策ソフトウェア','データを圧縮するソフトウェア','ネットワークを管理するソフトウェア'],a:0,cat:'IT一般'},
  {q:'「パッチ」とは何ですか？',choices:['不具合修正やセキュリティ強化のための更新プログラム','プログラムの設計書','データのバックアップ','ハードウェアの部品'],a:0,cat:'IT一般'},
  {q:'「ログ」とは何ですか？',choices:['システムの動作履歴を記録したデータ','ユーザーのパスワード','ネットワークの設定ファイル','プログラムのソースコード'],a:0,cat:'IT一般'},
  {q:'「ポート」（ネットワーク）とは何ですか？',choices:['通信先のアプリケーションを識別する番号','ネットワークケーブルの差込口','ルーターのIPアドレス','MACアドレスの別名'],a:0,cat:'IT一般'},

  // ===== ネットワーク・通信 =====
  {q:'ループバックアドレスとして正しいのはどれですか？',choices:['127.0.0.1','192.168.0.1','10.0.0.1','255.255.255.255'],a:0,cat:'ネットワーク'},
  {q:'HTTPのデフォルトポート番号はいくつですか？',choices:['80','443','22','21'],a:0,cat:'ネットワーク'},
  {q:'HTTPSのデフォルトポート番号はいくつですか？',choices:['443','80','8080','22'],a:0,cat:'ネットワーク'},
  {q:'SSHのデフォルトポート番号はいくつですか？',choices:['22','23','21','25'],a:0,cat:'ネットワーク'},
  {q:'FTPのデフォルトポート番号はいくつですか？',choices:['21','20','22','25'],a:0,cat:'ネットワーク'},
  {q:'SMTPのデフォルトポート番号はいくつですか？',choices:['25','110','143','993'],a:0,cat:'ネットワーク'},
  {q:'OSI参照モデルは全部で何層ですか？',choices:['7層','4層','5層','6層'],a:0,cat:'ネットワーク'},
  {q:'OSI参照モデルの第1層（物理層）の役割はどれですか？',choices:['電気信号・光信号などの物理的なデータ伝送','IPアドレスによる経路制御','データのエンドツーエンド転送','アプリケーション間の通信'],a:0,cat:'ネットワーク'},
  {q:'OSI参照モデルの第3層（ネットワーク層）の役割はどれですか？',choices:['IPアドレスによる経路制御（ルーティング）','MACアドレスによるフレーム転送','物理的なデータ伝送','セッション管理'],a:0,cat:'ネットワーク'},
  {q:'ルーターが動作するOSI参照モデルの層はどれですか？',choices:['第3層（ネットワーク層）','第1層（物理層）','第2層（データリンク層）','第4層（トランスポート層）'],a:0,cat:'ネットワーク'},
  {q:'スイッチングハブが動作するOSI参照モデルの層はどれですか？',choices:['第2層（データリンク層）','第1層（物理層）','第3層（ネットワーク層）','第4層（トランスポート層）'],a:0,cat:'ネットワーク'},
  {q:'pingコマンドで使われるプロトコルはどれですか？',choices:['ICMP','TCP','UDP','ARP'],a:0,cat:'ネットワーク'},
  {q:'MACアドレスは何ビットですか？',choices:['48ビット','32ビット','64ビット','128ビット'],a:0,cat:'ネットワーク'},
  {q:'IPv4アドレスは何ビットですか？',choices:['32ビット','48ビット','64ビット','128ビット'],a:0,cat:'ネットワーク'},
  {q:'IPv6アドレスは何ビットですか？',choices:['128ビット','64ビット','32ビット','256ビット'],a:0,cat:'ネットワーク'},
  {q:'DHCPの役割はどれですか？',choices:['IPアドレスを自動的に割り当てる','ドメイン名をIPアドレスに変換する','メールを送受信する','ファイルを転送する'],a:0,cat:'ネットワーク'},
  {q:'DNSの役割はどれですか？',choices:['ドメイン名をIPアドレスに変換する','IPアドレスを自動的に割り当てる','データを暗号化して送信する','ネットワークを監視する'],a:0,cat:'ネットワーク'},
  {q:'NATとは何の略ですか？',choices:['Network Address Translation','Network Access Terminal','Node Authentication Token','Null Address Table'],a:0,cat:'ネットワーク'},
  {q:'VPNとは何の略ですか？',choices:['Virtual Private Network','Very Powerful Node','Virtual Protocol Number','Verified Public Network'],a:0,cat:'ネットワーク'},
  {q:'ARPの役割はどれですか？',choices:['IPアドレスからMACアドレスを解決する','MACアドレスからIPアドレスを解決する','ドメイン名をIPアドレスに変換する','IPアドレスを自動割当てする'],a:0,cat:'ネットワーク'},
  {q:'プライベートIPアドレスのクラスCの範囲はどれですか？',choices:['192.168.0.0 ～ 192.168.255.255','10.0.0.0 ～ 10.255.255.255','172.16.0.0 ～ 172.31.255.255','169.254.0.0 ～ 169.254.255.255'],a:0,cat:'ネットワーク'},
  {q:'TCPの特徴として正しいのはどれですか？',choices:['信頼性の高い接続型通信（確認応答あり）','高速だが信頼性のない非接続型通信','暗号化された通信','ブロードキャスト通信'],a:0,cat:'ネットワーク'},
  {q:'UDPの特徴として正しいのはどれですか？',choices:['高速だが信頼性のない非接続型通信','信頼性の高い接続型通信','暗号化された通信','マルチキャスト専用通信'],a:0,cat:'ネットワーク'},
  {q:'「帯域幅」とは何ですか？',choices:['単位時間あたりに転送できるデータ量の最大値','通信の遅延時間','ネットワーク機器の数','IPアドレスの範囲'],a:0,cat:'ネットワーク'},
  {q:'「レイテンシ」とは何ですか？',choices:['データが送信元から宛先に届くまでの遅延時間','ネットワークの最大転送速度','接続できる端末の最大数','パケットの消失率'],a:0,cat:'ネットワーク'},
  {q:'CDNとは何の略ですか？',choices:['Content Delivery Network','Central Data Node','Common Domain Name','Compact Data Network'],a:0,cat:'ネットワーク'},
  {q:'「プロキシサーバー」の役割はどれですか？',choices:['クライアントに代わってサーバーと通信する中継サーバー','IPアドレスを管理するサーバー','メールを管理するサーバー','ファイルを管理するサーバー'],a:0,cat:'ネットワーク'},
  {q:'「ロードバランサー」の役割はどれですか？',choices:['複数のサーバーに通信を分散させる装置','通信を暗号化する装置','IPアドレスを割り当てる装置','ネットワークを監視する装置'],a:0,cat:'ネットワーク'},
  {q:'「パケット」とは何ですか？',choices:['ネットワーク上で転送されるデータの小さな単位','ネットワーク機器のこと','通信の速度を表す単位','ネットワークの設定ファイル'],a:0,cat:'ネットワーク'},
  {q:'「全二重通信」とは何ですか？',choices:['送信と受信を同時に行える通信方式','交互に送受信する通信方式','一方向のみの通信方式','ブロードキャストの通信方式'],a:0,cat:'ネットワーク'},
  {q:'NASとは何の略ですか？',choices:['Network Attached Storage','Node Access System','Network Authentication Service','Null Address Segment'],a:0,cat:'ネットワーク'},
  {q:'WAFとは何ですか？',choices:['Webアプリケーションへの攻撃を検知・遮断するファイアウォール','無線LANのアクセスポイント','Webサーバーの設定ファイル','ウイルス対策ソフト'],a:0,cat:'ネットワーク'},
  {q:'「デフォルトゲートウェイ」とは何ですか？',choices:['外部ネットワークへの出口となるルーターのIPアドレス','インターネットのサーバーアドレス','ネットワーク内の管理サーバー','DNSサーバーのアドレス'],a:0,cat:'ネットワーク'},
  {q:'「サブネットマスク」の役割はどれですか？',choices:['IPアドレスのネットワーク部とホスト部を区別する','IPアドレスを暗号化する','IPアドレスを自動割当てする','ドメイン名を解決する'],a:0,cat:'ネットワーク'},
  {q:'スター型トポロジーの特徴はどれですか？',choices:['すべての端末が中央のスイッチやハブに接続される','すべての端末が1本のケーブルでつながる','すべての端末が輪状につながる','端末同士が網状に接続される'],a:0,cat:'ネットワーク'},
  {q:'Wi-Fi 6の規格名はどれですか？',choices:['IEEE 802.11ax','IEEE 802.11ac','IEEE 802.11n','IEEE 802.11g'],a:0,cat:'ネットワーク'},
  {q:'Bluetoothが使用する主な周波数帯はどれですか？',choices:['2.4GHz帯','5GHz帯','900MHz帯','60GHz帯'],a:0,cat:'ネットワーク'},
  {q:'「QoS」とは何の略ですか？',choices:['Quality of Service','Queue of Sessions','Quick Online Sync','Query Operation System'],a:0,cat:'ネットワーク'},
  {q:'ブロードキャストアドレスとはどれですか？',choices:['同一ネットワーク内の全ホストに送信するアドレス','特定の1台にだけ送信するアドレス','複数の特定グループに送信するアドレス','自分自身に送信するアドレス'],a:0,cat:'ネットワーク'},
  {q:'「SSID」とは何ですか？',choices:['無線LANのネットワーク識別名','Wi-Fiルーターのパスワード','IPアドレスの別名','MACアドレスの種類'],a:0,cat:'ネットワーク'},
  {q:'「DMZ」（ネットワーク）とは何ですか？',choices:['外部と内部ネットワークの中間に置く非武装地帯のセグメント','無線LANの電波の届く範囲','VPNのトンネル区間','ファイアウォールの設定エリア'],a:0,cat:'ネットワーク'},
  {q:'「スループット」とは何ですか？',choices:['実際に転送できたデータ量（実効速度）','理論上の最大転送速度','通信の遅延時間','パケット消失率'],a:0,cat:'ネットワーク'},
  {q:'ポート番号「3389」といえば何のプロトコルですか？',choices:['RDP（リモートデスクトッププロトコル）','HTTP','SSH','FTP'],a:0,cat:'ネットワーク'},
  {q:'「ICMP」の用途として正しいのはどれですか？',choices:['ネットワーク診断・エラー通知（pingなど）','ファイル転送','メール送信','Webページ表示'],a:0,cat:'ネットワーク'},
  {q:'IPアドレス「169.254.x.x」とはどういう状態ですか？',choices:['DHCPからIPを取得できなかった時の自動割当アドレス（APIPA）','プライベートIPアドレスの一種','ループバックアドレスの範囲','クラスAのプライベートアドレス'],a:0,cat:'ネットワーク'},

  // ===== プログラミング全般 =====
  {q:'「変数」とは何ですか？',choices:['データを一時的に格納するための名前付きの箱','プログラムの命令文','繰り返し処理の単位','条件を判定するための式'],a:0,cat:'プログラミング'},
  {q:'「配列」とは何ですか？',choices:['同じ種類のデータを順番に並べて格納するデータ構造','条件分岐の構文','繰り返し処理の構文','関数の別名'],a:0,cat:'プログラミング'},
  {q:'オブジェクト指向の「継承」とは何ですか？',choices:['親クラスの性質を子クラスが受け継ぐ仕組み','データを外部から隠す仕組み','同じ名前のメソッドが異なる動作をする仕組み','クラスからオブジェクトを生成すること'],a:0,cat:'プログラミング'},
  {q:'「カプセル化」とは何ですか？',choices:['データや処理をひとまとめにして外部から直接触れないようにする仕組み','親クラスの性質を子クラスが受け継ぐ仕組み','同じ名前のメソッドが異なる動作をする仕組み','クラスからオブジェクトを生成すること'],a:0,cat:'プログラミング'},
  {q:'「インスタンス」とは何ですか？',choices:['クラスをもとに作られた実体のオブジェクト','クラスの設計図そのもの','クラスの初期化メソッド','クラスの継承関係'],a:0,cat:'プログラミング'},
  {q:'「再帰（再帰関数）」とは何ですか？',choices:['関数が自分自身を呼び出す処理','関数を別の関数に渡す処理','関数を繰り返し定義する処理','外部ライブラリを呼び出す処理'],a:0,cat:'プログラミング'},
  {q:'「スタック」の特徴はどれですか？',choices:['後から入れたものを先に取り出す（LIFO）構造','先に入れたものを先に取り出す（FIFO）構造','ランダムにアクセスできる構造','キーで検索できる構造'],a:0,cat:'プログラミング'},
  {q:'「キュー」の特徴はどれですか？',choices:['先に入れたものを先に取り出す（FIFO）構造','後から入れたものを先に取り出す（LIFO）構造','ランダムにアクセスできる構造','キーで検索できる構造'],a:0,cat:'プログラミング'},
  {q:'二分探索の計算量（最悪）はどれですか？',choices:['O(log n)','O(n)','O(n²)','O(1)'],a:0,cat:'プログラミング'},
  {q:'バブルソートの計算量（最悪）はどれですか？',choices:['O(n²)','O(n log n)','O(log n)','O(n)'],a:0,cat:'プログラミング'},
  {q:'「コンパイル言語」の特徴はどれですか？',choices:['実行前にソースコード全体を機械語に変換する','一行ずつ読み込みながら実行する','ブラウザ上で動作する','スクリプト形式で記述する'],a:0,cat:'プログラミング'},
  {q:'Gitの「commit」とは何ですか？',choices:['変更内容をローカルリポジトリに記録・保存すること','変更内容をリモートに送ること','リモートから最新を取得すること','ブランチを統合すること'],a:0,cat:'プログラミング'},
  {q:'Gitの「push」とは何ですか？',choices:['ローカルの変更内容をリモートリポジトリに送ること','リモートから最新を取得すること','ブランチを統合すること','新しいリポジトリを作ること'],a:0,cat:'プログラミング'},
  {q:'Gitの「pull」とは何ですか？',choices:['リモートリポジトリの最新を取得してローカルに反映すること','ローカルの変更を送ること','変更を記録すること','ブランチを切ること'],a:0,cat:'プログラミング'},
  {q:'Gitの「branch」とは何ですか？',choices:['メインの開発ラインから分岐した独立した作業ライン','変更の記録単位','リモートリポジトリ','プロジェクトのフォルダ構造'],a:0,cat:'プログラミング'},
  {q:'MVCパターンの「M」は何ですか？',choices:['Model（データ・ビジネスロジック）','Module','Monitor','Memory'],a:0,cat:'プログラミング'},
  {q:'MVCパターンの「V」は何ですか？',choices:['View（画面表示）','Variable','Version','Validation'],a:0,cat:'プログラミング'},
  {q:'MVCパターンの「C」は何ですか？',choices:['Controller（制御・橋渡し）','Cache','Compile','Connection'],a:0,cat:'プログラミング'},
  {q:'「NULL（ヌル）」とは何ですか？',choices:['値が存在しないことを示す特別な値','ゼロのこと','空文字のこと','エラーのこと'],a:0,cat:'プログラミング'},
  {q:'「例外処理」とは何ですか？',choices:['プログラム実行中のエラーを捕捉して対処する仕組み','エラーを無視して処理を続ける仕組み','エラーが起きないようにするテスト','パフォーマンスを改善する処理'],a:0,cat:'プログラミング'},
  {q:'「フレームワーク」と「ライブラリ」の違いはどれですか？',choices:['フレームワークはアプリの骨格を提供し処理の流れを制御、ライブラリは機能部品を提供','フレームワークは無料でライブラリは有料','フレームワークはサーバー用、ライブラリはクライアント用','違いはない'],a:0,cat:'プログラミング'},
  {q:'RESTとは何の略ですか？',choices:['Representational State Transfer','Remote Execution Service Terminal','Recursive Endpoint Server Transfer','Reliable Entry System Token'],a:0,cat:'プログラミング'},
  {q:'データベースの「CRUD」のCは何ですか？',choices:['Create（作成）','Copy','Connect','Check'],a:0,cat:'プログラミング'},
  {q:'データベースの「CRUD」のRは何ですか？',choices:['Read（読み取り）','Remove','Restore','Register'],a:0,cat:'プログラミング'},
  {q:'SQLの「SELECT」の役割はどれですか？',choices:['テーブルからデータを取得する','データを挿入する','データを更新する','テーブルを削除する'],a:0,cat:'プログラミング'},
  {q:'「インデックス」（データベース）とは何ですか？',choices:['検索を高速化するためにデータに付けた索引','テーブルの行番号','データの並び順','テーブルの列名'],a:0,cat:'プログラミング'},
  {q:'「トランザクション」とは何ですか？',choices:['一連のデータベース操作をひとまとまりとして扱う仕組み','データの暗号化方法','サーバーへの接続方式','データのバックアップ処理'],a:0,cat:'プログラミング'},
  {q:'「Dockerコンテナ」とは何ですか？',choices:['アプリとその実行環境をひとまとめにした軽量な仮想環境','仮想マシンの別名','クラウドサーバーの種類','Linuxの一種'],a:0,cat:'プログラミング'},
  {q:'CI/CDとはどういう意味ですか？',choices:['継続的インテグレーション／継続的デリバリーの自動化プロセス','コードのバックアップとデプロイのこと','テストと設計のこと','コードレビューとデプロイのこと'],a:0,cat:'プログラミング'},
  {q:'「リファクタリング」とは何ですか？',choices:['外部からの動作を変えずにコードの内部構造を整理・改善すること','機能を追加することなくバグを修正すること','パフォーマンスを最適化すること','コードを削除してシンプルにすること'],a:0,cat:'プログラミング'},
  {q:'「デプロイ」とは何ですか？',choices:['作成したアプリケーションを本番環境に配置して稼働させること','コードをテストすること','コードをコンパイルすること','コードを設計すること'],a:0,cat:'プログラミング'},
  {q:'「静的型付け言語」の特徴はどれですか？',choices:['変数の型をコンパイル時に決定する','変数の型を実行時に決定する','型を宣言しなくてもよい','型が存在しない'],a:0,cat:'プログラミング'},
  {q:'HTTPメソッドのうち「新しいデータを作成する」のに使うのはどれですか？',choices:['POST','GET','DELETE','PUT'],a:0,cat:'プログラミング'},
  {q:'「正規表現」とは何ですか？',choices:['文字列のパターンを記述するための表現方法','変数の命名規則','データベースの正規化手法','コードの整形ルール'],a:0,cat:'プログラミング'},
  {q:'「非同期処理」とは何ですか？',choices:['処理の完了を待たずに次の処理を実行する方式','複数CPUで並列実行する処理','エラーを後で処理する方法','バックグラウンドでサーバーを動かすこと'],a:0,cat:'プログラミング'},
  {q:'「イテレータ」とは何ですか？',choices:['コレクション内の要素を順番に取り出す仕組み','繰り返し回数を数えるカウンター','配列の要素数を返す関数','ループ構文の別名'],a:0,cat:'プログラミング'},

  // ===== セキュリティ =====
  {q:'「マルウェア」とは何ですか？',choices:['悪意ある目的で作られた不正なソフトウェアの総称','コンピュータを遅くするだけのソフト','広告を表示するソフト','不要ファイルのこと'],a:0,cat:'セキュリティ'},
  {q:'「ランサムウェア」とは何ですか？',choices:['ファイルを暗号化して身代金を要求するマルウェア','スパムメールを大量送信するマルウェア','パスワードを盗むマルウェア','ウェブカメラを乗っ取るマルウェア'],a:0,cat:'セキュリティ'},
  {q:'「フィッシング」とは何ですか？',choices:['偽サイトや偽メールで個人情報を騙し取る攻撃','大量のアクセスでサーバーを落とす攻撃','ソフトの脆弱性を突く攻撃','盗聴によってデータを取得する攻撃'],a:0,cat:'セキュリティ'},
  {q:'「ブルートフォース攻撃」とは何ですか？',choices:['パスワードをすべての組み合わせで試す総当たり攻撃','偽サイトで情報を盗む攻撃','SQLを悪用してデータを取得する攻撃','マルウェアを感染させる攻撃'],a:0,cat:'セキュリティ'},
  {q:'「SQLインジェクション」とは何ですか？',choices:['入力フォームに不正なSQLを埋め込んでデータベースを不正操作する攻撃','SQLサーバーに大量接続する攻撃','SQLファイルにウイルスを仕込む攻撃','データベースのパスワードを総当たりする攻撃'],a:0,cat:'セキュリティ'},
  {q:'「XSS（クロスサイトスクリプティング）」とは何ですか？',choices:['悪意あるスクリプトをウェブページに埋め込んで閲覧者を攻撃する手法','サイト間でSQLを注入する攻撃','偽サイトを作って誘導する攻撃','Webサーバーをクラッシュさせる攻撃'],a:0,cat:'セキュリティ'},
  {q:'「DDoS攻撃」とは何ですか？',choices:['多数の端末から大量アクセスをしてサーバーをダウンさせる攻撃','1台から大量データを送る攻撃','メールで悪意あるファイルを送る攻撃','パスワードを総当たりする攻撃'],a:0,cat:'セキュリティ'},
  {q:'「ゼロデイ攻撃」とは何ですか？',choices:['修正パッチが公開される前の脆弱性を狙った攻撃','ゼロ時台に行われる攻撃','パスワードが「0000」のシステムを狙う攻撃','ウイルスの感染から0日で広まる攻撃'],a:0,cat:'セキュリティ'},
  {q:'「ソーシャルエンジニアリング」とは何ですか？',choices:['技術的でなく人間の心理・行動を利用して情報を騙し取る手法','SNSを使った攻撃手法','社員同士の情報漏洩','企業のITシステムへの侵入'],a:0,cat:'セキュリティ'},
  {q:'二要素認証で「持っているもの」の例はどれですか？',choices:['スマートフォン（認証アプリ・SMS）','パスワード','指紋','秘密の質問'],a:0,cat:'セキュリティ'},
  {q:'「対称暗号」の特徴はどれですか？',choices:['暗号化と復号に同じ鍵を使う','暗号化と復号に異なる鍵を使う','鍵を使わずに暗号化する','公開鍵のみを使う'],a:0,cat:'セキュリティ'},
  {q:'「公開鍵暗号」の特徴はどれですか？',choices:['公開鍵で暗号化し秘密鍵で復号する','同じ鍵で暗号化と復号を行う','暗号化した人だけが復号できる','ブロック単位で暗号化する'],a:0,cat:'セキュリティ'},
  {q:'SSL/TLSの役割はどれですか？',choices:['通信を暗号化して盗聴・改ざんを防ぐ','ウイルスを検知して除去する','不正アクセスをブロックする','パスワードを管理する'],a:0,cat:'セキュリティ'},
  {q:'「デジタル署名」の役割はどれですか？',choices:['送信者の認証とデータの改ざんがないことを証明する','データを暗号化する','パスワードを管理する','通信速度を上げる'],a:0,cat:'セキュリティ'},
  {q:'セキュリティのCIAトライアードの「C」は何ですか？',choices:['Confidentiality（機密性）','Control','Credential','Certificate'],a:0,cat:'セキュリティ'},
  {q:'セキュリティのCIAトライアードの「I」は何ですか？',choices:['Integrity（完全性・改ざんされていないこと）','Identification','Infrastructure','Input'],a:0,cat:'セキュリティ'},
  {q:'セキュリティのCIAトライアードの「A」は何ですか？',choices:['Availability（可用性・使えること）','Authentication','Authorization','Access'],a:0,cat:'セキュリティ'},
  {q:'「最小権限の原則」とは何ですか？',choices:['ユーザーに必要最低限の権限だけを付与すること','パスワードをできるだけ短くすること','管理者だけがシステムを使えること','権限を定期的にリセットすること'],a:0,cat:'セキュリティ'},
  {q:'「パスワードのハッシュ化」とは何ですか？',choices:['パスワードを一方向の計算で変換して元に戻せない形で保存すること','パスワードを暗号化して保存すること','パスワードを圧縮して保存すること','パスワードをBase64で変換すること'],a:0,cat:'セキュリティ'},
  {q:'「ソルト」（パスワード）とは何ですか？',choices:['ハッシュ化前にパスワードに付加するランダムな文字列','パスワードの最低文字数制限','パスワードを暗号化する鍵','二要素認証の一種'],a:0,cat:'セキュリティ'},
  {q:'「ペネトレーションテスト」とは何ですか？',choices:['許可を得た上でシステムへ実際に侵入を試みてセキュリティを評価するテスト','ファイアウォールの設定を確認するテスト','社員のセキュリティ意識を調査するテスト','ウイルスの検知率を確認するテスト'],a:0,cat:'セキュリティ'},
  {q:'「バックドア」とは何ですか？',choices:['認証を回避してシステムに侵入できる隠し入口','バックアップ用のサーバー','不要なプロセスを終了する機能','セキュリティログの削除機能'],a:0,cat:'セキュリティ'},
  {q:'「キーロガー」とは何ですか？',choices:['キーボードの入力を記録してパスワード等を盗むマルウェア','ファイルを暗号化するマルウェア','大量のメールを送るマルウェア','Webカメラを盗撮するマルウェア'],a:0,cat:'セキュリティ'},
  {q:'「ボットネット」とは何ですか？',choices:['マルウェアに感染して遠隔操作される端末の集団','ファイアウォールの一種','セキュリティ監視システム','正規のプログラムのネットワーク'],a:0,cat:'セキュリティ'},
  {q:'「CSRF（クロスサイトリクエストフォージェリ）」とは何ですか？',choices:['ログイン済みユーザーに意図しないリクエストを送らせる攻撃','偽サイトで情報を盗む攻撃','スクリプトを注入する攻撃','SQLを注入する攻撃'],a:0,cat:'セキュリティ'},
  {q:'「セキュリティパッチ」とは何ですか？',choices:['脆弱性を修正するためのソフトウェア更新プログラム','ウイルスの感染を確認するツール','セキュリティ診断レポート','ファイアウォールの設定ファイル'],a:0,cat:'セキュリティ'},
  {q:'「多層防御」とは何ですか？',choices:['複数のセキュリティ対策を重ねることで一つが突破されても守れるようにする考え方','ファイアウォールを多数設置すること','パスワードを複雑にすること','複数の認証方式を使うこと'],a:0,cat:'セキュリティ'},
  {q:'AES暗号の種類はどれですか？',choices:['対称暗号（共通鍵暗号）','非対称暗号（公開鍵暗号）','ハッシュ関数','電子署名'],a:0,cat:'セキュリティ'},
  {q:'「認証」と「認可」の違いはどれですか？',choices:['認証は「誰か」の確認、認可は「何ができるか」の許可','認証はログイン、認可はパスワードリセット','認証はサーバー側、認可はクライアント側','違いはない'],a:0,cat:'セキュリティ'},
  {q:'「インシデントレスポンス」とは何ですか？',choices:['セキュリティ事故が発生した際の対応・復旧プロセス','定期的なセキュリティ診断','社員教育プログラム','ファイアウォールの更新作業'],a:0,cat:'セキュリティ'},
  {q:'「ホワイトリスト方式」とは何ですか？',choices:['許可するものだけを明示的に登録し、それ以外をすべて拒否する方式','禁止するものを登録し、それ以外を許可する方式','信頼できるサイトの一覧','セキュリティ研究者のリスト'],a:0,cat:'セキュリティ'},
];

// ===== 成績ログ =====
const QUIZ_LOG_KEY = 'itquiz_log';

function quizLogLoad(){
  try { return JSON.parse(localStorage.getItem(QUIZ_LOG_KEY) || '[]'); } catch(e){ return []; }
}
function quizLogSave(logs){
  localStorage.setItem(QUIZ_LOG_KEY, JSON.stringify(logs));
}
function quizLogAdd(score){
  const logs = quizLogLoad();
  const now = new Date();
  const ts = now.getFullYear() + '/' +
    String(now.getMonth()+1).padStart(2,'0') + '/' +
    String(now.getDate()).padStart(2,'0') + ' ' +
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0');
  logs.unshift({ ts, score, total:10 });
  if(logs.length > 50) logs.length = 50; // 最大50件
  quizLogSave(logs);
}
function quizLogDelete(idx){
  const logs = quizLogLoad();
  logs.splice(idx, 1);
  quizLogSave(logs);
  renderQuizLog();
}
function quizLogClear(){
  if(!confirm('成績ログを全件削除しますか？')) return;
  localStorage.removeItem(QUIZ_LOG_KEY);
  renderQuizLog();
}

function renderQuizLog(){
  const logs = quizLogLoad();
  const avg = logs.length ? (logs.reduce((s,l)=>s+l.score,0)/logs.length).toFixed(1) : '-';
  const best = logs.length ? Math.max(...logs.map(l=>l.score)) : '-';
  const rows = logs.length === 0
    ? '<div style="text-align:center;color:var(--text-muted);padding:16px;">まだ記録がありませんわ〜</div>'
    : logs.map((l,i)=>{
        const stars = l.score===10?'⭐':l.score>=8?'★★':l.score>=6?'★':'';
        return `<div class="quiz-log-row">
          <span style="color:var(--text-muted);font-size:11px;min-width:110px;">${l.ts}</span>
          <span style="font-weight:700;color:${l.score>=8?'var(--accent)':l.score>=6?'var(--text)':'var(--text-muted)'};">${l.score}/${l.total} ${stars}</span>
          <button class="quiz-log-del" onclick="quizLogDelete(${i})">✕</button>
        </div>`;
      }).join('');
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">成績ログ</div>
    <div style="display:flex;gap:16px;margin:8px 0 12px;justify-content:center;">
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">平均</div>
        <div style="font-size:22px;font-weight:700;color:var(--accent);">${avg}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">最高</div>
        <div style="font-size:22px;font-weight:700;color:var(--accent);">${best}</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-muted);">回数</div>
        <div style="font-size:22px;font-weight:700;color:var(--accent);">${logs.length}</div>
      </div>
    </div>
    <div class="quiz-log-list">${rows}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
      ${logs.length>0?`<button class="game-back-btn" style="width:100%;color:#e05555;" onclick="quizLogClear()">全件削除</button>`:''}
      <button class="game-back-btn" style="width:100%;" onclick="openGameModeMenu()">戻る</button>
    </div>`;
}

// ===== クイズ状態 =====
let _quiz = {};

function initQuiz(){
  const questions = [...QUIZ_QUESTIONS].sort(()=>Math.random()-0.5).slice(0,10);
  _quiz = { questions, idx:0, score:0, answered:false };
  renderQuizQuestion();
}

function renderQuizQuestion(){
  const q = _quiz.questions[_quiz.idx];
  const num = _quiz.idx + 1;
  const pct = Math.round((_quiz.idx/10)*100);
  const shuffled = q.choices.map((c,i)=>({text:c,correct:i===q.a})).sort(()=>Math.random()-0.5);
  const btns = shuffled.map((c,i)=>`
    <button class="quiz-choice-btn" onclick="answerQuiz(${i},this,${c.correct})">${c.text}</button>
  `).join('');
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">ITクイズ <span style="font-size:13px;color:var(--text-muted);">${num}/10</span></div>
    <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${pct}%"></div></div>
    <div class="quiz-cat-badge">${q.cat}</div>
    <div class="oth-comment" id="quizComment">${quizCmt('start')}</div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-choices">${btns}</div>
    <div style="margin-top:auto;">
      <button class="game-back-btn" style="width:100%;margin-top:8px;" onclick="openGameModeMenu()">やめる</button>
    </div>`;
}

function answerQuiz(idx, btn, isCorrect){
  if(_quiz.answered) return;
  _quiz.answered = true;
  const allBtns = document.querySelectorAll('.quiz-choice-btn');
  allBtns.forEach(b => b.disabled = true);
  if(isCorrect){
    btn.classList.add('quiz-correct');
    _quiz.score++;
    document.getElementById('quizComment').textContent = quizCmt('correct');
  } else {
    btn.classList.add('quiz-wrong');
    const correctText = _quiz.questions[_quiz.idx].choices[_quiz.questions[_quiz.idx].a];
    allBtns.forEach(b=>{ if(b !== btn && b.textContent.trim() === correctText) b.classList.add('quiz-correct'); });
    document.getElementById('quizComment').textContent = quizCmt('wrong');
  }
  const choices = document.querySelector('.quiz-choices');
  const nextBtn = document.createElement('button');
  nextBtn.className = 'game-back-btn';
  nextBtn.style.cssText = 'width:100%;margin-top:12px;background:var(--accent);color:#fff;';
  nextBtn.textContent = _quiz.idx < 9 ? '次の問題 →' : '結果を見る';
  nextBtn.onclick = () => {
    _quiz.idx++;
    _quiz.answered = false;
    if(_quiz.idx < 10) renderQuizQuestion();
    else renderQuizResult();
  };
  choices.appendChild(nextBtn);
}

function renderQuizResult(){
  const s = _quiz.score;
  quizLogAdd(s);
  let cmt, star;
  if(s===10){ cmt=quizCmt('perfect'); star='⭐⭐⭐'; }
  else if(s>=8){ cmt=quizCmt('great'); star='⭐⭐'; }
  else if(s>=6){ cmt=quizCmt('good'); star='⭐'; }
  else if(s>=4){ cmt=quizCmt('normal'); star=''; }
  else { cmt=quizCmt('bad'); star=''; }
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">クイズ結果 ${star}</div>
    <div style="text-align:center;margin:18px 0;">
      <div style="font-size:52px;font-weight:700;color:var(--accent);">${s}<span style="font-size:22px;color:var(--text-muted)">/10</span></div>
    </div>
    <div class="oth-comment">${cmt}</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px;">
      <button class="game-back-btn" style="font-size:15px;padding:12px;background:var(--accent);color:#fff;" onclick="initQuiz()">もう一回！</button>
      <button class="game-back-btn" style="font-size:15px;padding:12px;" onclick="renderQuizLog()">成績ログを見る</button>
      <button class="game-back-btn" style="font-size:15px;padding:12px;" onclick="openGameModeMenu()">ゲーム選択に戻る</button>
      <button class="game-back-btn" style="font-size:15px;padding:12px;" onclick="closeGame()">とじる</button>
    </div>`;
}

function openGameModeMenu(){
  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">ゲームモード</div>
    <div class="oth-comment">どっちで遊びますか？</div>
    <div style="display:flex;flex-direction:column;gap:14px;margin-top:18px;">
      <button class="game-back-btn" style="font-size:16px;padding:14px;" onclick="initOthello()">♟ オセロ</button>
      <button class="game-back-btn" style="font-size:16px;padding:14px;background:var(--accent);color:#fff;" onclick="initQuiz()">💡 ITクイズ</button>
    </div>
    <div style="margin-top:12px;">
      <button class="game-back-btn" style="width:100%;font-size:13px;color:var(--text-muted);" onclick="renderQuizLog()">📊 成績ログ</button>
    </div>
    <div style="margin-top:8px;">
      <button class="game-back-btn" style="width:100%;margin-top:4px;" onclick="closeGame()">とじる</button>
    </div>`;
}
