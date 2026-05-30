// ===== Claude用語 IT QUIZ =====

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

// ===== 眼鏡リマちゃんSVG =====
const RIMA_GLASSES_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="56" height="56" style="flex-shrink:0">
  <circle cx="50" cy="56" r="44" fill="#F0EBE6"/>
  <circle cx="33" cy="44" r="2.5" fill="#1A1614"/>
  <circle cx="59" cy="44" r="2.5" fill="#1A1614"/>
  <path d="M39 54 Q46 57 53 54" stroke="#1A1614" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="33" cy="44" rx="9.5" ry="7.5" fill="none" stroke="#3A2A20" stroke-width="2"/>
  <ellipse cx="59" cy="44" rx="9.5" ry="7.5" fill="none" stroke="#3A2A20" stroke-width="2"/>
  <line x1="42.5" y1="44" x2="49.5" y2="44" stroke="#3A2A20" stroke-width="2"/>
  <line x1="23.5" y1="43" x2="15" y2="41" stroke="#3A2A20" stroke-width="2"/>
  <line x1="68.5" y1="43" x2="77" y2="41" stroke="#3A2A20" stroke-width="2"/>
</svg>`;

// ===== タイプライター =====
let _typewriterTimer = null;

function typewriterEffect(elementId, text, speed, onComplete) {
  if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }
  const el = document.getElementById(elementId);
  if (!el) return;
  let i = 0;
  el.textContent = '';
  _typewriterTimer = setInterval(() => {
    if (i < text.length) {
      el.textContent += text[i++];
    } else {
      clearInterval(_typewriterTimer);
      _typewriterTimer = null;
      if (onComplete) onComplete();
    }
  }, speed || 28);
}

function typewriterSkip(text, onComplete) {
  if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }
  const el = document.getElementById('quizQuestion');
  if (el) el.textContent = text;
  if (onComplete) onComplete();
}

// ===== 問題リスト =====
const QUIZ_QUESTIONS = [

  // ===== Claude / AI用語 =====
  {q:'「トークン」とはAIにとって何ですか？',choices:['テキストを処理する基本単位（文字や単語の断片）','AIの処理速度の単位','AIへの入力ファイルの形式','AIモデルのバージョン番号'],a:0,cat:'Claude/AI用語'},
  {q:'「プロンプト」とは何ですか？',choices:['AIへの入力テキスト・指示文','AIの出力結果','AIのモデルファイル','AIのエラーメッセージ'],a:0,cat:'Claude/AI用語'},
  {q:'「LLM」とは何の略ですか？',choices:['Large Language Model','Low Latency Module','Language Learning Machine','Long Loop Method'],a:0,cat:'Claude/AI用語'},
  {q:'「コンテキストウィンドウ」とは何ですか？',choices:['AIが一度に参照できるテキストの最大量','AIのメモリ容量','ブラウザのウィンドウサイズ','画面に表示される文字数'],a:0,cat:'Claude/AI用語'},
  {q:'「ハルシネーション」とはAIにとって何ですか？',choices:['AIが事実でない情報をもっともらしく生成する現象','AIが処理できずに止まる現象','AIが同じ回答を繰り返す現象','AIが画像を生成する機能'],a:0,cat:'Claude/AI用語'},
  {q:'「MCP」とは何の略ですか？（ClaudeのMCP）',choices:['Model Context Protocol','Multi-Channel Processing','Machine Code Pipeline','Memory Control Port'],a:0,cat:'Claude/AI用語'},
  {q:'「RAG」とは何の略ですか？',choices:['Retrieval-Augmented Generation','Random Access Generator','Rapid Algorithm Graph','Repeated Action Group'],a:0,cat:'Claude/AI用語'},
  {q:'Claudeの「システムプロンプト」とは何ですか？',choices:['AIの動作・役割・制約を事前に定義する指示','ユーザーが送るメッセージ','AIの回答文','コンピュータを起動するコマンド'],a:0,cat:'Claude/AI用語'},
  {q:'AIのTemperature（温度）を高く設定すると何が起きますか？',choices:['回答の多様性・ランダム性が上がる','処理速度が速くなる','コンテキストが増える','エラーが減る'],a:0,cat:'Claude/AI用語'},
  {q:'「エンベディング」とはAI分野で何ですか？',choices:['テキストを数値ベクトルに変換して意味を表現する技術','画像をテキストに変換する技術','AIモデルを圧縮する技術','データを暗号化する技術'],a:0,cat:'Claude/AI用語'},
  {q:'Claudeが「Worktree」モードを使う理由は何ですか？',choices:['元ファイルに影響なく隔離した作業コピーで変更するため','ファイルをバックアップするため','コードをコンパイルするため','ネットワーク接続を管理するため'],a:0,cat:'Claude/AI用語'},
  {q:'「ファインチューニング」とは何ですか？',choices:['事前学習済みモデルを特定用途向けに追加学習させること','モデルの画質を上げること','AIの処理速度を調整すること','プロンプトを短くすること'],a:0,cat:'Claude/AI用語'},
  {q:'「Tool use（ツール使用）」とはAIにとって何ですか？',choices:['AIが外部のツールや機能を呼び出して実行する能力','AIがツールの説明文を生成すること','プロンプトに画像を添付すること','モデルをアップデートすること'],a:0,cat:'Claude/AI用語'},
  {q:'「マルチモーダル」とはAIにとって何ですか？',choices:['テキスト・画像・音声など複数の形式を扱えること','複数のAIが同時に動くこと','複数言語に対応していること','複数のユーザーが使えること'],a:0,cat:'Claude/AI用語'},
  {q:'「APIキー」とは何ですか？',choices:['APIサービスを利用するための認証用の秘密の文字列','キーボードの特殊キー','データの暗号化キー','データベースのプライマリキー'],a:0,cat:'Claude/AI用語'},
  {q:'「サンドボックス」とはコンピュータ用語で何ですか？',choices:['本番環境に影響を与えない隔離された実行環境','子供向けゲームのこと','テスト用のデータベース','デバッグモードの別名'],a:0,cat:'Claude/AI用語'},
  {q:'「プロンプトエンジニアリング」とは何ですか？',choices:['AIから望む出力を得るためにプロンプトを工夫・設計する技術','AIのモデルを設計する技術','AIのUIを設計する技術','AIを配備するインフラ設計'],a:0,cat:'Claude/AI用語'},
  {q:'「zero-shot」とは何ですか？（AI文脈）',choices:['例を一切示さずにAIにタスクを指示すること','AIが0秒で回答すること','データなしでモデルを学習すること','画像ゼロで動作するAI'],a:0,cat:'Claude/AI用語'},
  {q:'「few-shot」とは何ですか？（AI文脈）',choices:['少数の例を示してAIにタスクのパターンを伝える方法','少量のデータで学習させること','短いプロンプトを使うこと','少人数で使うAIサービス'],a:0,cat:'Claude/AI用語'},
  {q:'Claudeの「Artifact」とは何ですか？（Coworkモード）',choices:['Claudeが作成・保存する成果物ページ（再訪可能）','Claudeのモデルファイル','エラーログのこと','プロンプトのテンプレート'],a:0,cat:'Claude/AI用語'},
  {q:'「スキル」とは何ですか？（Claude Coworkの）',choices:['Claudeの能力を拡張するインストール可能な機能パック','Claudeの知識データベース','プログラミング言語の一種','クラウドストレージサービス'],a:0,cat:'Claude/AI用語'},
  {q:'AIの「推論（Inference）」とは何ですか？',choices:['学習済みモデルに入力を与えて出力を得ること','AIを新たに学習させること','モデルの精度を評価すること','データを前処理すること'],a:0,cat:'Claude/AI用語'},
  {q:'「ベクターデータベース」とは何ですか？',choices:['エンベディング（ベクトル）で意味検索ができるデータベース','グラフィック用のデータベース','Excelファイルを管理するデータベース','動画を管理するデータベース'],a:0,cat:'Claude/AI用語'},
  {q:'Claudeの「scheduled task（スケジュールタスク）」とは何ですか？',choices:['指定した時刻や間隔で自動実行される仕事','タスクの優先順位リスト','Claudeとの会話のこと','ファイルの整理機能'],a:0,cat:'Claude/AI用語'},
  {q:'「プラグイン」とは何ですか？（Claude Coworkの）',choices:['MCPやスキルをまとめた拡張機能パック','Claudeのメインプログラム','ファイルの種類','ユーザーの設定ファイル'],a:0,cat:'Claude/AI用語'},

  // ===== シェル・コマンド =====
  {q:'「Bash」とは何ですか？',choices:['LinuxやmacOSで使われるシェル（コマンド実行環境）','Pythonのフレームワーク','データベースの種類','ファイル圧縮形式'],a:0,cat:'シェル・コマンド'},
  {q:'「Python」の特徴として正しいのはどれですか？',choices:['読みやすい文法でAIや自動化によく使われるプログラミング言語','コンパイル必須の低レベル言語','Excelのマクロ専用言語','ネットワーク設定専用のコマンドツール'],a:0,cat:'シェル・コマンド'},
  {q:'「grep」コマンドは何をしますか？',choices:['ファイルからパターンに一致する行を検索する','ファイルをコピーする','ディレクトリ一覧を表示する','ファイルを削除する'],a:0,cat:'シェル・コマンド'},
  {q:'「Glob」とはプログラミングで何ですか？',choices:['*(アスタリスク)などのワイルドカードでファイルパスのパターンを指定する方法','ファイルを圧縮する機能','ネットワークの通信形式','データベースの検索方法'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「ls」コマンドは何をしますか？',choices:['現在のディレクトリのファイル一覧を表示する','ファイルを削除する','ファイルを移動する','ファイルを圧縮する'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「cd」コマンドは何をしますか？',choices:['ディレクトリ（フォルダ）を移動する','ファイルを作成する','プロセスを終了する','ファイルの内容を表示する'],a:0,cat:'シェル・コマンド'},
  {q:'「pip install」は何をするコマンドですか？',choices:['Pythonのライブラリ・パッケージをインストールする','Pythonのプログラムを実行する','Pythonファイルをコンパイルする','Pythonの設定を初期化する'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「cat ファイル名」は何をしますか？',choices:['ファイルの内容をターミナルに表示する','ファイルを削除する','ファイルをコピーする','ファイルを圧縮する'],a:0,cat:'シェル・コマンド'},
  {q:'「cron」とは何ですか？',choices:['指定した時刻・間隔でコマンドを自動実行するスケジューラー','ファイル圧縮ツール','プロセス監視ツール','ネットワーク診断ツール'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「sudo」をつけるとどうなりますか？',choices:['管理者（root）権限でコマンドを実行する','コマンドをバックグラウンドで実行する','コマンドの実行を一時停止する','コマンドの実行履歴を表示する'],a:0,cat:'シェル・コマンド'},
  {q:'シェルで「|」（パイプ）を使うと何ができますか？',choices:['前のコマンドの出力を次のコマンドの入力として渡す','コマンドを並列に実行する','コマンドの出力をファイルに保存する','コマンドを繰り返し実行する'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「>」を使うと何ができますか？',choices:['コマンドの出力をファイルに書き込む（上書き）','コマンドの出力をターミナルに表示する','ファイルの内容を比較する','コマンドの出力を別のコマンドに渡す'],a:0,cat:'シェル・コマンド'},
  {q:'「chmod」コマンドは何をしますか？',choices:['ファイルやディレクトリのアクセス権限を変更する','ファイルの所有者を変更する','ファイルを移動する','ファイルを圧縮する'],a:0,cat:'シェル・コマンド'},
  {q:'Pythonのファイルの拡張子は何ですか？',choices:['.py','.python','.pt','.pyscript'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「mkdir」は何をしますか？',choices:['新しいディレクトリ（フォルダ）を作成する','ディレクトリを削除する','ディレクトリを移動する','ディレクトリの一覧を表示する'],a:0,cat:'シェル・コマンド'},
  {q:'「curl」コマンドは何をしますか？',choices:['URLにHTTPリクエストを送ってデータを取得・送信する','ファイルを暗号化する','DNSを解決する','ポートをスキャンする'],a:0,cat:'シェル・コマンド'},
  {q:'Bashで「rm -rf」は何をしますか？',choices:['ディレクトリごと強制的に再帰削除する（取り消し不可）','ファイルをリモートサーバーに送る','ファイルをランダムに並び替える','ファイルのアクセス権をリセットする'],a:0,cat:'シェル・コマンド'},
  {q:'「シェバン（#!）」行（例：#!/bin/bash）は何を意味しますか？',choices:['スクリプトを実行するインタープリタの場所を指定する','コメント行','プログラムのバージョン','管理者権限の要求'],a:0,cat:'シェル・コマンド'},
  {q:'「npm install」は何をするコマンドですか？',choices:['Node.jsのパッケージをインストールする','JavaScriptを実行する','ウェブサーバーを起動する','JavaScriptをコンパイルする'],a:0,cat:'シェル・コマンド'},
  {q:'Pythonで「import」は何をしますか？',choices:['外部ライブラリやモジュールを読み込む','ファイルをコピーする','データをデータベースに取り込む','関数を定義する'],a:0,cat:'シェル・コマンド'},

  // ===== Git・GitHub =====
  {q:'「Git」とは何ですか？',choices:['ソースコードの変更履歴を管理する分散型バージョン管理システム','コードを実行するツール','コードを共有するSNS','コードを暗号化するシステム'],a:0,cat:'Git・GitHub'},
  {q:'「GitHub」とは何ですか？',choices:['Gitリポジトリをオンラインでホスティング・共有するサービス','Gitの作成者の名前','Gitコマンドのこと','AIコード補完ツール'],a:0,cat:'Git・GitHub'},
  {q:'「リポジトリ（repository）」とは何ですか？',choices:['プロジェクトのファイルと変更履歴をまとめて管理する場所','ファイルを保存するだけのフォルダ','コードを実行する仮想環境','クラウドストレージサービス'],a:0,cat:'Git・GitHub'},
  {q:'「git commit」は何をしますか？',choices:['変更内容をローカルリポジトリに記録・保存する','変更をリモートに送る','リモートの変更を取得する','ブランチを切り替える'],a:0,cat:'Git・GitHub'},
  {q:'「git push」は何をしますか？',choices:['ローカルのコミットをリモートリポジトリに送る','リモートの変更をローカルに取り込む','変更を記録する','ブランチを作成する'],a:0,cat:'Git・GitHub'},
  {q:'「git pull」は何をしますか？',choices:['リモートの最新変更をローカルに取得して反映する','ローカルの変更をリモートに送る','変更を破棄する','ブランチを削除する'],a:0,cat:'Git・GitHub'},
  {q:'「PAT（Personal Access Token）」とは何ですか？',choices:['GitHubへの操作を認証するための個人用トークン（パスワードの代替）','プログラムの実行権限','プロジェクトの管理権限','パスワードマネージャーのこと'],a:0,cat:'Git・GitHub'},
  {q:'「.gitignore」ファイルの役割は何ですか？',choices:['Gitで管理しないファイル・フォルダを指定する','Gitの設定を保存する','コミットメッセージのテンプレート','ブランチの一覧を保存する'],a:0,cat:'Git・GitHub'},
  {q:'「git clone」は何をしますか？',choices:['リモートリポジトリをローカルにコピーする','ブランチをコピーする','コミットをコピーする','ファイルをコピーする'],a:0,cat:'Git・GitHub'},
  {q:'「git diff」は何を表示しますか？',choices:['変更前後のファイルの差分（どこが変わったか）','コミットの一覧','ブランチの一覧','リモートの状態'],a:0,cat:'Git・GitHub'},
  {q:'「git status」は何を表示しますか？',choices:['変更されたファイルや追跡状態の一覧','コミット履歴','ブランチの一覧','リモートとローカルの差分'],a:0,cat:'Git・GitHub'},
  {q:'「git merge」は何をしますか？',choices:['指定したブランチの変更を現在のブランチに統合する','ブランチを削除する','ブランチを作成する','コミットを取り消す'],a:0,cat:'Git・GitHub'},
  {q:'「HEAD」とはGitで何ですか？',choices:['現在チェックアウトしているコミットを指すポインタ','最初のコミット','ブランチ名','リモートリポジトリの別名'],a:0,cat:'Git・GitHub'},
  {q:'「fork（フォーク）」とはGitHubで何ですか？',choices:['他人のリポジトリを自分のアカウントにコピーして独立した開発をすること','ブランチを分岐させること','コードをコピーする一般的な操作','リポジトリをバックアップすること'],a:0,cat:'Git・GitHub'},
  {q:'「git stash」は何をしますか？',choices:['コミットせずに変更内容を一時的に退避させる','変更を破棄する','ブランチを一時停止する','ファイルをバックアップする'],a:0,cat:'Git・GitHub'},
  {q:'「git log」は何を表示しますか？',choices:['コミットの履歴（日時・作者・メッセージ）','変更ファイルの差分','ブランチの一覧','リモートの接続状態'],a:0,cat:'Git・GitHub'},
  {q:'「Worktree（ワークツリー）」とはGitで何ですか？',choices:['1つのリポジトリから複数の作業ディレクトリを同時に使える仕組み','作業用のブランチの別名','ファイルのバックアップフォルダ','ステージングエリアの別名'],a:0,cat:'Git・GitHub'},
  {q:'GitHubの「Pull Request（PR）」とは何ですか？',choices:['ブランチの変更をマージしてほしいと提案する機能','リモートから取得するコマンドの別名','コードを削除する申請','リポジトリを公開する操作'],a:0,cat:'Git・GitHub'},
  {q:'「git revert」は何をしますか？',choices:['指定したコミットの変更を打ち消す新しいコミットを作る','コミット履歴ごと変更を消す','ファイルを元の状態に戻す','ブランチを削除する'],a:0,cat:'Git・GitHub'},
  {q:'「git branch」は何を表示しますか？（引数なしの場合）',choices:['ローカルのブランチ一覧と現在のブランチ','リモートのブランチ一覧','コミット一覧','タグ一覧'],a:0,cat:'Git・GitHub'},

  // ===== データ形式 =====
  {q:'「JSON」の特徴として正しいのはどれですか？',choices:['キーと値のペアで構造化データを表現するテキスト形式','表形式のデータを表現する形式','画像を表現するファイル形式','圧縮ファイルの形式'],a:0,cat:'データ形式'},
  {q:'「Markdown」とは何ですか？',choices:['記号を使ってテキストに見出し・太字・リストなどを表現するシンプルな記法','表計算ソフトのファイル形式','プログラミング言語の一種','データベースのクエリ言語'],a:0,cat:'データ形式'},
  {q:'MarkdownでH1見出しを作る記号はどれですか？',choices:['# (ハッシュ1つ)','## (ハッシュ2つ)','** (アスタリスク2つ)','--- (ハイフン3つ)'],a:0,cat:'データ形式'},
  {q:'「YAML」の特徴として正しいのはどれですか？',choices:['インデントで階層を表現する人間が読みやすい設定ファイル形式','バイナリ形式の設定ファイル','Excelと互換性のある形式','データを暗号化する形式'],a:0,cat:'データ形式'},
  {q:'「CSV」とは何の略ですか？',choices:['Comma-Separated Values','Compact Storage Volume','Common Source Variable','Code Structured View'],a:0,cat:'データ形式'},
  {q:'「UTF-8」とは何ですか？',choices:['世界中の文字を扱える文字エンコード（符号化）形式','ファイル圧縮の規格','通信プロトコルの種類','フォントの規格'],a:0,cat:'データ形式'},
  {q:'JSONで配列（リスト）を表す記号はどれですか？',choices:['[] (角括弧)','{} (波括弧)','() (丸括弧)','<> (山括弧)'],a:0,cat:'データ形式'},
  {q:'JSONでオブジェクトを表す記号はどれですか？',choices:['{} (波括弧)','[] (角括弧)','() (丸括弧)','<> (山括弧)'],a:0,cat:'データ形式'},
  {q:'「Base64」とは何ですか？',choices:['バイナリデータをテキスト（英数字+記号）に変換するエンコード方式','64ビットの暗号化方式','データを64分割して送信する方式','64種類の文字セット'],a:0,cat:'データ形式'},
  {q:'「正規表現」とは何ですか？',choices:['文字列のパターンをルールで記述する表現方法（検索・置換に使う）','変数の命名規則','データベースの正規化手法','コードの整形ルール'],a:0,cat:'データ形式'},
  {q:'Markdownで太字を表現する記号はどれですか？',choices:['**テキスト** (アスタリスク2つで囲む)','__テキスト__ (アンダースコア2つで囲む)','##テキスト## (ハッシュで囲む)','||テキスト|| (パイプで囲む)'],a:0,cat:'データ形式'},
  {q:'「.md」ファイルは何の形式ですか？',choices:['Markdownファイル','Microsoftドキュメント','Macドキュメント','Mobileデバイス用ファイル'],a:0,cat:'データ形式'},
  {q:'「XMLとJSONの違い」として正しいのはどれですか？',choices:['XMLはタグで囲む形式、JSONは波括弧と角括弧で表現する形式','XMLはJSONの古い名前','JSONはXMLより情報量が多い','違いはない'],a:0,cat:'データ形式'},
  {q:'「BOMなしUTF-8」が推奨される理由は何ですか？',choices:['ファイル先頭の特殊バイトがシステムやExcelで誤動作を起こすのを防ぐため','ファイルサイズが小さくなるため','読み込みが高速になるため','暗号化が適用されるため'],a:0,cat:'データ形式'},
  {q:'「TOML」とは何ですか？',choices:['設定ファイル向けのシンプルで読みやすいファイル形式','テキスト専用のファイル形式','Pythonの設定形式の正式名称','Toolのマークアップ言語'],a:0,cat:'データ形式'},

  // ===== Excel・VBA =====
  {q:'VBAで「Debug.Print」は何をしますか？',choices:['イミディエイトウィンドウに値を出力してデバッグする','メッセージボックスを表示する','ログファイルに書き込む','エラーを無視して続行する'],a:0,cat:'Excel・VBA'},
  {q:'「イミディエイトウィンドウ」はどこで開きますか？（VBE内）',choices:['Ctrl+G またはVBEの「表示」メニュー','ExcelのデータタブのVBAメニュー','ファイルメニューの「環境設定」','ツールメニューの「マクロ」'],a:0,cat:'Excel・VBA'},
  {q:'「.xlsm」拡張子のファイルとは何ですか？',choices:['マクロ（VBA）を含むExcelファイル','読み取り専用のExcelファイル','Excelテンプレートファイル','暗号化されたExcelファイル'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「Sub」と「Function」の違いは何ですか？',choices:['Subは値を返さない、Functionは値を返す','SubはExcel専用、Functionは全アプリ共通','Subは1回しか使えない、Functionは何度でも使える','違いはない'],a:0,cat:'Excel・VBA'},
  {q:'「VBE」とは何ですか？',choices:['Visual Basic Editor。VBAコードを書く開発環境','Visual Basic Engineのこと','Excelのバージョン情報画面','Excelの設定エディタ'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「MsgBox」は何をしますか？',choices:['ポップアップメッセージボックスを表示する','メッセージをログに書き込む','メールを送信する','ステータスバーにメッセージを表示する'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「Range("A1").Value」は何ですか？',choices:['セルA1の値を取得または設定するプロパティ','セルA1の書式を取得するプロパティ','セルA1の位置を取得するプロパティ','セルA1の色を取得するプロパティ'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「For Each」ループは何をしますか？',choices:['コレクション（配列・セル範囲など）の要素を1つずつ処理する','指定回数だけ繰り返す','条件が真の間繰り返す','ランダムな順番で繰り返す'],a:0,cat:'Excel・VBA'},
  {q:'「ThisWorkbook」とはVBAで何ですか？',choices:['VBAコードが書かれているExcelファイル自身を指す','現在開いているすべてのブック','Excelアプリケーション全体','アクティブなシート'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「ActiveSheet」は何ですか？',choices:['現在選択・表示されているシート','最初のシート','一番最後のシート','コードが書かれているシート'],a:0,cat:'Excel・VBA'},
  {q:'ExcelのVBAでショートカット「Alt + F11」は何をしますか？',choices:['VBE（Visual Basic Editor）を開く','マクロ実行ダイアログを開く','イミディエイトウィンドウを開く','Excelを終了する'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「On Error Resume Next」は何をしますか？',choices:['エラーが起きても無視して次の行に進む','エラーが起きたら処理を止める','エラーの種類を表示する','エラー発生時に特定の処理に飛ぶ'],a:0,cat:'Excel・VBA'},
  {q:'Excelで「VLOOKUP」関数の役割は何ですか？',choices:['指定した値を表の左端で検索し同じ行の指定列の値を返す','セルの値を縦方向に合計する','条件に合うセルの数を数える','2つのセルの値を比較する'],a:0,cat:'Excel・VBA'},
  {q:'Excelで「ピボットテーブル」とは何ですか？',choices:['大量データを集計・クロス集計して多角的に分析する機能','セルを回転させる機能','縦横を入れ替える（転置）機能','データをグラフ化する機能'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「Application.ScreenUpdating = False」の目的は何ですか？',choices:['画面の再描画を止めてマクロの処理を高速化する','画面を保護する','アニメーションを停止する','スクリーンショットを撮る'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「Split関数」は何をしますか？',choices:['文字列を指定の区切り文字で分割して配列として返す','配列を結合して文字列にする','文字列を大文字・小文字に変換する','文字列の長さを返す'],a:0,cat:'Excel・VBA'},
  {q:'Excelで「XLOOKUP」が「VLOOKUP」より優れている点はどれですか？',choices:['検索列より左の列も参照でき完全一致がデフォルトで使いやすい','処理速度が圧倒的に速い','ピボットテーブルと連携できる','複数シートを一括検索できる'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「Workbooks.Open」は何をしますか？',choices:['指定したExcelファイルを開く','新しいブックを作成する','ブックを保存する','ブックを閉じる'],a:0,cat:'Excel・VBA'},
  {q:'Excelの「条件付き書式」とは何ですか？',choices:['指定した条件に合うセルに自動でスタイルや色を適用する機能','セルの入力規則を設定する機能','数式を自動補完する機能','セルの保護を条件付きで行う機能'],a:0,cat:'Excel・VBA'},
  {q:'VBAで「Cells(1, 1)」は何を指しますか？',choices:['行1、列1のセル（=A1）','A列の1行目（=A1と同じ）','シートの先頭セル','名前ボックスに「1,1」と入力したセル'],a:0,cat:'Excel・VBA'},
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
  if(logs.length > 50) logs.length = 50;
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
  if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }
  const questions = [...QUIZ_QUESTIONS].sort(()=>Math.random()-0.5).slice(0,10);
  _quiz = { questions, idx:0, score:0, answered:false };
  renderQuizQuestion();
}

function _showChoices() {
  const choicesEl = document.getElementById('quizChoices');
  if (choicesEl) {
    choicesEl.style.opacity = '1';
    choicesEl.style.transition = 'opacity 0.35s ease';
    choicesEl.style.pointerEvents = 'auto';
  }
}

function renderQuizQuestion(){
  const q = _quiz.questions[_quiz.idx];
  const num = _quiz.idx + 1;
  const pct = Math.round((_quiz.idx/10)*100);
  const shuffled = q.choices.map((c,i)=>({text:c,correct:i===q.a})).sort(()=>Math.random()-0.5);
  _quiz.shuffled = shuffled;
  const btns = shuffled.map((c,i)=>`
    <button class="quiz-choice-btn" onclick="answerQuiz(${i},this,${c.correct})">${c.text}</button>
  `).join('');

  document.getElementById('gamePanel').innerHTML=`
    <div class="game-title">Claudeクイズ <span style="font-size:13px;color:var(--text-muted);">${num}/10</span></div>
    <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${pct}%"></div></div>
    <div class="quiz-cat-badge">${q.cat}</div>
    <div style="display:flex;align-items:center;gap:8px;margin:6px 0;">
      ${RIMA_GLASSES_SVG}
      <div class="oth-comment" id="quizComment" style="margin:0;flex:1;">${quizCmt('start')}</div>
    </div>
    <div class="quiz-question" id="quizQuestion"
      style="cursor:pointer;min-height:48px;"
      title="タップで全文表示"
      onclick="typewriterSkipNow()"></div>
    <div class="quiz-choices" id="quizChoices"
      style="opacity:0;pointer-events:none;">${btns}</div>
    <div style="margin-top:auto;">
      <button class="game-back-btn" style="width:100%;margin-top:8px;" onclick="openGameModeMenu()">やめる</button>
    </div>`;

  typewriterEffect('quizQuestion', q.q, 28, _showChoices);
}

function typewriterSkipNow() {
  const q = _quiz.questions[_quiz.idx];
  if (!q) return;
  typewriterSkip(q.q, _showChoices);
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
    const correctText = _quiz.shuffled.find(s=>s.correct)?.text || '';
    allBtns.forEach(b=>{ if(b.textContent.trim() === correctText) b.classList.add('quiz-correct'); });
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
      <button class="game-back-btn" style="font-size:16px;padding:14px;background:var(--accent);color:#fff;" onclick="initQuiz()">💡 Claudeクイズ</button>
    </div>
    <div style="margin-top:12px;">
      <button class="game-back-btn" style="width:100%;font-size:13px;color:var(--text-muted);" onclick="renderQuizLog()">📊 成績ログ</button>
    </div>
    <div style="margin-top:8px;">
      <button class="game-back-btn" style="width:100%;margin-top:4px;" onclick="closeGame()">とじる</button>
    </div>`;
}
