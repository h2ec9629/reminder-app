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
  // ===== JS構文（Claudeが書いたコードに出てくるやつ）=====
  {q:'「テンプレートリテラル」とは何ですか？',choices:['バッククォート(`)で囲み ${ } で変数を埋め込める文字列の書き方','HTMLのテンプレート専用ファイル','文字列を暗号化する機能','定型文を保存しておく機能'],a:0,cat:'JS構文'},
  {q:'テンプレートリテラルで変数を埋め込む書き方はどれですか？',choices:['`こんにちは ${name} さん`','`こんにちは {name} さん`','`こんにちは %name% さん`','`こんにちは <name> さん`'],a:0,cat:'JS構文'},
  {q:'「オプショナルチェイン（?.）」の役割はどれですか？',choices:['途中の値がなくてもエラーにせず undefined を返す','必ず値があることを保証する','条件分岐を短く書く','非同期処理を待つ'],a:0,cat:'JS構文'},
  {q:'obj?.name の「?.」が無くて obj が空(null)だとどうなりますか？',choices:['エラーで処理が止まる','自動でundefinedになる','空文字が入る','0になる'],a:0,cat:'JS構文'},
  {q:'「アロー関数（=>）」とは何ですか？',choices:['function を短く書ける関数の記法','矢印を画面に描く命令','配列を並べ替える記号','比較演算子の一種'],a:0,cat:'JS構文'},
  {q:'「async / await」は何のための書き方ですか？',choices:['時間のかかる処理(非同期)を、順番に書ける形で待つため','処理を高速化するため','エラーを無視するため','複数CPUで並列実行するため'],a:0,cat:'JS構文'},
  {q:'「const」と「let」の違いはどれですか？',choices:['constは再代入できない、letは再代入できる','constは数値専用、letは文字専用','違いはなく好みで使う','constはグローバル、letはローカル'],a:0,cat:'JS構文'},
  {q:'「クラスフィールド」とは何ですか？',choices:['クラスの中に直接書いた変数（プロパティ）の定義','畑のように区切られた画面領域','クラスの継承関係','データベースの列'],a:0,cat:'JS構文'},
  {q:'「コールバック関数」とは何ですか？',choices:['他の処理に渡して、あとで呼んでもらう関数','電話を折り返す機能','エラー時だけ動く関数','必ず最初に動く関数'],a:0,cat:'JS構文'},
  {q:'コード中の「//」から行末までは何ですか？',choices:['コメント（実行されないメモ書き）','割り算の記号','URLの一部','エラー表示'],a:0,cat:'JS構文'},
  {q:'「setTimeout」の役割はどれですか？',choices:['指定した時間だけ待ってから処理を実行する','処理を即座に止める','時計を表示する','タイムアウトエラーを出す'],a:0,cat:'JS構文'},
  {q:'「localStorage」とは何ですか？',choices:['ブラウザにデータを保存しておく仕組み（閉じても残る）','パソコンのCドライブ','クラウド上の保管庫','一時的なメモリで閉じると消える'],a:0,cat:'JS構文'},

  // ===== エンコード・データ表現 =====
  {q:'「エンコード」とは何ですか？',choices:['データをある決まった形式に変換すること','データを削除すること','データを暗号化して隠すこと','データを圧縮すること'],a:0,cat:'データ表現'},
  {q:'「文字コード（文字エンコーディング）」とは何ですか？',choices:['文字をコンピュータが扱える数値に対応させる取り決め','パスワードの暗号','プログラムの命令','フォントのデザイン'],a:0,cat:'データ表現'},
  {q:'日本語の文字化けが起きる主な原因はどれですか？',choices:['保存時と表示時の文字コードが食い違っている','ファイルが大きすぎる','インターネットが遅い','フォントが古い'],a:0,cat:'データ表現'},
  {q:'世界中の文字を1つの体系で扱える文字コードはどれですか？',choices:['UTF-8（Unicode）','Shift_JIS','ASCII','EUC-JP'],a:0,cat:'データ表現'},
  {q:'「BOM」とは何ですか？',choices:['ファイル先頭に付く、文字コードを示す目印データ','爆発を表す効果音','通信エラーの一種','バックアップの略'],a:0,cat:'データ表現'},
  {q:'「改行コード」のCRLFとLFの違いに関係するのはどれですか？',choices:['WindowsとMac/Linuxで改行の表し方が違うこと','文字の大きさ','行間の広さ','段落の数'],a:0,cat:'データ表現'},
  {q:'「JSON」とは何ですか？',choices:['データを名前と値のセットで表す、軽量なデータ形式','画像ファイルの形式','プログラミング言語','データベースソフト'],a:0,cat:'データ表現'},
  {q:'「Base64」とは何ですか？',choices:['データを文字だけで表せる形に変換する方式','64ビットのパソコン','暗号化の最強方式','64色のカラーパレット'],a:0,cat:'データ表現'},

  // ===== Web/PWA（このアプリで出てきた言葉）=====
  {q:'「Service Worker」とは何ですか？',choices:['ブラウザの裏で動き、オフライン動作やキャッシュを担う仕組み','サーバーを管理する作業員','常駐するウイルス','画面を描画する機能'],a:0,cat:'Web/PWA'},
  {q:'「キャッシュ」とは何ですか？',choices:['よく使うデータを一時保存して次回を速くする仕組み','不要ファイルを消す機能','現金のこと','暗号化の一種'],a:0,cat:'Web/PWA'},
  {q:'アプリを直したのに古いままなのは、よく何のせいですか？',choices:['古いファイルがキャッシュに残って読み込まれている','インターネットが切れている','パソコンが壊れている','ファイルが消えた'],a:0,cat:'Web/PWA'},
  {q:'「ハードリロード（Ctrl+Shift+R）」とは何ですか？',choices:['キャッシュを無視してページを読み直すこと','パソコンを強制再起動すること','データを全削除すること','画面を明るくすること'],a:0,cat:'Web/PWA'},
  {q:'「PWA」とは何ですか？',choices:['Webサイトをアプリのように使える仕組み','プログラムの設計図','有料アプリの略','ウイルスの種類'],a:0,cat:'Web/PWA'},
  {q:'HTMLの onclick="..." は何を指定していますか？',choices:['クリックされた時に実行する処理','文字の色','リンク先のURL','ボタンのサイズ'],a:0,cat:'Web/PWA'},
  {q:'タッチイベントだけで作るとPCで動かないことがある理由はどれですか？',choices:['タップ(touch)とクリック(click)は別のイベントだから','PCにはタッチがないから壊れる','PCの方が処理が速いから','ブラウザが古いから'],a:0,cat:'Web/PWA'},

  // ===== AI・開発のやり取りで出る言葉 =====
  {q:'「デバッグ」とは何ですか？',choices:['プログラムの不具合を見つけて直すこと','プログラムを速くすること','プログラムを消すこと','プログラムを保存すること'],a:0,cat:'AI・開発'},
  {q:'コンソールの「is not defined」エラーは何を意味しますか？',choices:['呼び出した関数や変数が定義されていない','インターネットが切れている','ファイルが大きすぎる','権限が足りない'],a:0,cat:'AI・開発'},
  {q:'「構文（シンタックス）エラー」とは何ですか？',choices:['書き方のルール違反でプログラムが読めない状態','処理に時間がかかりすぎる状態','メモリが足りない状態','通信に失敗した状態'],a:0,cat:'AI・開発'},
  {q:'「差分（diff）」とは何ですか？',choices:['変更前と変更後の違いを表したもの','データの合計','ファイルの容量','エラーの数'],a:0,cat:'AI・開発'},
  {q:'「フルコード出力」とは何ですか？',choices:['一部だけでなくコード全体をまるごと出すこと','コードを暗号化して出すこと','コードを実行すること','コードを削除すること'],a:0,cat:'AI・開発'},
  {q:'「リファクタリング」とは何ですか？',choices:['動きを変えずにコードの中身を整理・改善すること','機能を新しく追加すること','コードを全部消すこと','バグをわざと作ること'],a:0,cat:'AI・開発'},
  {q:'「マウント」（フォルダの）とは何ですか？',choices:['別の場所のフォルダを、自分の環境から使えるように繋ぐこと','フォルダを山積みにすること','フォルダを暗号化すること','フォルダを印刷すること'],a:0,cat:'AI・開発'},
  {q:'「タイムスタンプ」とは何ですか？',choices:['ファイルの作成・更新日時の記録','処理にかかった時間','時計の画像','締め切りの通知'],a:0,cat:'AI・開発'},
  {q:'「フォールバック」とは何ですか？',choices:['本命がダメな時に使う予備の手段','処理が後戻りすること','エラーで落ちること','データの巻き戻し'],a:0,cat:'AI・開発'},

  // ===== AI会話で飛んでくる用語（最優先・厚め）=====
  {q:'「トークン」とはAIにとって何ですか？',choices:['文章を区切った処理の単位（料金や上限の数え方）','ログイン用の合言葉','仮想通貨の一種','エラーの種類'],a:0,cat:'AI用語'},
  {q:'「プロンプト」とは何ですか？',choices:['AIへの指示・お願いの文章','プログラムの設計図','エラーメッセージ','起動画面'],a:0,cat:'AI用語'},
  {q:'「コンテキストウィンドウ」とは何ですか？',choices:['AIが一度に覚えていられる文章量の上限','画面の表示領域','設定メニュー','会話の保存先'],a:0,cat:'AI用語'},
  {q:'「ハルシネーション」とはAIで何ですか？',choices:['もっともらしいウソをAIが言ってしまうこと','処理が遅くなること','画像が乱れること','通信が切れること'],a:0,cat:'AI用語'},
  {q:'「LLM」とは何の略（種類）ですか？',choices:['大量の文章を学習した、大規模な言語モデル','小型の翻訳機','音声認識専用AI','画像生成専用AI'],a:0,cat:'AI用語'},
  {q:'AIに前提や条件を最初に伝える文を何と呼びますか？',choices:['システムプロンプト','起動コード','初期化ファイル','ログイン情報'],a:0,cat:'AI用語'},
  {q:'「ファインチューニング」とは何ですか？',choices:['既存のAIを特定用途向けに追加学習させること','AIの音量を調整すること','画面の明るさ調整','処理速度の設定'],a:0,cat:'AI用語'},
  {q:'「推論（インファレンス）」とはAIで何ですか？',choices:['学習済みAIが実際に答えを出す処理','新しく学習すること','データを保存すること','エラーを直すこと'],a:0,cat:'AI用語'},
  {q:'「学習（トレーニング）」とはAIで何ですか？',choices:['大量のデータからパターンを身につける処理','問題を解くこと','データを消すこと','設定を変えること'],a:0,cat:'AI用語'},
  {q:'「マルチモーダル」とはAIで何ですか？',choices:['文章だけでなく画像や音声も一緒に扱えること','複数人で使えること','多言語対応のこと','複数台で動くこと'],a:0,cat:'AI用語'},
  {q:'「zero-shot（ゼロショット）」とは何ですか？',choices:['例を一つも見せずにAIに答えさせること','一発で当てること','無料で使うこと','初回起動のこと'],a:0,cat:'AI用語'},
  {q:'「few-shot（フューショット）」とは何ですか？',choices:['いくつか例を見せてからAIに答えさせること','少人数で使うこと','短時間処理','少額課金'],a:0,cat:'AI用語'},
  {q:'AIに「ステップバイステップで考えて」と頼むのは何のためですか？',choices:['順を追って考えさせ、答えの精度を上げるため','処理を遅くするため','文字数を増やすため','料金を下げるため'],a:0,cat:'AI用語'},
  {q:'「Temperature（温度）」をAIで上げるとどうなりますか？',choices:['答えがより多様で創造的（ばらつきが増える）になる','処理が熱くなる','料金が上がる','文字が大きくなる'],a:0,cat:'AI用語'},
  {q:'「エンベディング（embedding）」とは何ですか？',choices:['文章を意味の近さで数値ベクトルに変換したもの','埋め込み画像のこと','動画の挿入','背景の設定'],a:0,cat:'AI用語'},
  {q:'「RAG」とはAIで何の仕組みですか？',choices:['外部の資料を検索して、それを元に答えさせる仕組み','画像を生成する仕組み','音声を出す仕組み','翻訳する仕組み'],a:0,cat:'AI用語'},
  {q:'「MCP」とはClaudeにとって何ですか？',choices:['Claudeを外部のアプリやデータに繋ぐ共通の仕組み','料金プランの名前','エラーコード','起動方法'],a:0,cat:'AI用語'},
  {q:'「Tool use（ツール使用）」とはAIで何ですか？',choices:['AIが計算や検索など外部の道具を呼び出して使うこと','工具の使い方を教えること','設定画面のこと','操作マニュアル'],a:0,cat:'AI用語'},
  {q:'「エージェント」とはAIで何ですか？',choices:['目標に向けて自分で手順を考え道具も使って動くAI','営業担当者','代理店','広告のこと'],a:0,cat:'AI用語'},
  {q:'「APIキー」とは何ですか？',choices:['サービスを使うための本人確認用の鍵となる文字列','物理的な鍵','パスワードの暗号化','暗証番号の入力欄'],a:0,cat:'AI用語'},
  {q:'「API」とは何ですか？',choices:['ソフト同士が情報をやり取りするための窓口','画面のデザイン','保存形式','通信回線'],a:0,cat:'AI用語'},
  {q:'「ナレッジカットオフ」とはAIで何ですか？',choices:['AIの知識が止まっている時点（それ以降は知らない）','使用量の上限','料金の締め日','処理の打ち切り'],a:0,cat:'AI用語'},
  {q:'AIに役割（例：あなたはプロの校正者です）を与えるのは何のためですか？',choices:['その立場に沿った回答にして精度や口調を整えるため','料金を下げるため','処理を速くするため','文字数を減らすため'],a:0,cat:'AI用語'},
  {q:'「生成AI」とは何ですか？',choices:['文章や画像などを新しく作り出すAI','データを集計するAI','監視カメラのAI','翻訳専用のAI'],a:0,cat:'AI用語'},
  {q:'AIの回答が毎回少し違うのはなぜですか？',choices:['確率的に言葉を選んでいて多少のばらつきがあるから','故障しているから','日付で変わるから','ネット速度のせい'],a:0,cat:'AI用語'},
  {q:'「チャットボット」とは何ですか？',choices:['会話形式で自動的に応答するプログラム','掃除ロボット','自動翻訳機','検索エンジン'],a:0,cat:'AI用語'},
  {q:'「アライメント」とはAIで何ですか？',choices:['AIの振る舞いを人間の意図や価値観に沿わせること','文字を揃えること','画面の位置調整','データの整列'],a:0,cat:'AI用語'},
  {q:'「ベンチマーク」とはAIで何ですか？',choices:['性能を共通の基準で測って比べる試験','作業台のこと','基準点の印','休憩のこと'],a:0,cat:'AI用語'},
  {q:'「オープンソース」とは何ですか？',choices:['中身のコードが公開され誰でも使える形','無料という意味だけ','未完成という意味','危険なソフト'],a:0,cat:'AI用語'},
  {q:'「クローズドソース（プロプライエタリ）」とは何ですか？',choices:['中身が公開されず提供元が管理するソフト','閉店したサービス','壊れたソフト','古いソフト'],a:0,cat:'AI用語'},
  {q:'「クラウド」とは何ですか？',choices:['自分のPCでなくネット上のサーバーで処理・保管する形','空模様のこと','保存に失敗すること','重い処理のこと'],a:0,cat:'AI用語'},
  {q:'「ローカル」とは何ですか？',choices:['自分のパソコンの中（手元）で動かすこと','地元のこと','低速のこと','古い方式'],a:0,cat:'AI用語'},
  {q:'「サーバー」とは何ですか？',choices:['サービスやデータを提供する側のコンピュータ','給仕係','保存ボタン','通信ケーブル'],a:0,cat:'AI用語'},
  {q:'「ストリーミング」とはAI出力で何ですか？',choices:['答えを一気にでなく少しずつ流して表示すること','動画を観ること','音楽配信のこと','データ転送の失敗'],a:0,cat:'AI用語'},
  {q:'「レイテンシ」とは何ですか？',choices:['応答が返るまでの遅れ（待ち時間）','潜在能力のこと','最新版のこと','残量のこと'],a:0,cat:'AI用語'},
  {q:'「スループット」とは何ですか？',choices:['一定時間にこなせる処理量','投げ捨てること','通り抜ける道','残り時間'],a:0,cat:'AI用語'},
  {q:'「パラメータ（モデルの）」とは何ですか？',choices:['AIが学習で身につけた無数の調整値','設定メニューの項目','料金プラン','入力欄'],a:0,cat:'AI用語'},
  {q:'「データセット」とは何ですか？',choices:['学習や分析に使うデータのまとまり','保存形式','表計算ソフト','設定ファイル'],a:0,cat:'AI用語'},
  {q:'「バイアス」とはAIで何ですか？',choices:['学習データの偏りが答えに出てしまうこと','画面の傾き','文字の太さ','通信の偏り'],a:0,cat:'AI用語'},
  {q:'「ガードレール」とはAIで何ですか？',choices:['危険・不適切な出力を防ぐための安全の仕組み','道路の柵','画面の枠','保存の制限'],a:0,cat:'AI用語'},
  {q:'AIへの指示で「具体例を入れる」と良いのはなぜですか？',choices:['望む答えの形が伝わり精度が上がるから','文字数が稼げるから','料金が下がるから','速くなるから'],a:0,cat:'AI用語'},
  {q:'AIに長い文章を要約させる時のコツはどれですか？',choices:['誰向け・何字程度かを指定する','とにかく短くと言うだけ','敬語で頼む','何度も同じことを送る'],a:0,cat:'AI用語'},
  {q:'「ロールプレイ」をAIに頼むとは何ですか？',choices:['特定の役柄になりきって応答させること','ゲームをすること','役者を探すこと','録音すること'],a:0,cat:'AI用語'},
  {q:'AIが「わかりません」と言う方が良い場面はどれですか？',choices:['情報が無いのに無理に断定してウソになるより安全だから','いつでも答えるべきではないから','料金がかかるから','処理が重いから'],a:0,cat:'AI用語'},
  {q:'「Claude」「GPT」などは何の名前ですか？',choices:['会話できる大規模言語モデル（AI）の名前','プログラミング言語','OSの名前','保存形式'],a:0,cat:'AI用語'},
  {q:'AIに「前の回答を踏まえて」と言えるのはなぜですか？',choices:['同じ会話の流れ（文脈）を覚えているから','録画しているから','メールで送るから','検索しているから'],a:0,cat:'AI用語'},
  {q:'「プロンプトインジェクション」とは何ですか？',choices:['悪意ある指示を混ぜてAIを誤動作させる攻撃','文章を注入する便利機能','高速化の手法','保存の方式'],a:0,cat:'AI用語'},
  {q:'AIに表で出してと頼むと良い場面はどれですか？',choices:['複数項目を比較したいとき','謝ってほしいとき','速く答えてほしいとき','料金を下げたいとき'],a:0,cat:'AI用語'},
  {q:'AIの回答を鵜呑みにせず確認すべき主な理由はどれですか？',choices:['事実と違うこと（ハルシネーション）があるから','必ず古い情報だから','日本語が苦手だから','遅いから'],a:0,cat:'AI用語'},
  {q:'「トークン消費」を抑えるのに有効なのはどれですか？',choices:['指示や貼り付けを簡潔にまとめる','敬語をやめる','夜に使う','改行を増やす'],a:0,cat:'AI用語'},

  // ===== JS構文（追加）=====
  {q:'「配列（Array）」とは何ですか？',choices:['複数の値を順番に並べて入れておく入れ物','1つだけ値を入れる箱','計算式','画面の部品'],a:0,cat:'JS構文'},
  {q:'「オブジェクト（{ }）」とは何ですか？',choices:['名前と値のセットをまとめたデータの入れ物','物体の3D表示','ボタンのこと','エラーの種類'],a:0,cat:'JS構文'},
  {q:'配列の「.map()」は何をしますか？',choices:['各要素を加工して新しい配列を作る','地図を表示する','要素を消す','要素数を数える'],a:0,cat:'JS構文'},
  {q:'配列の「.filter()」は何をしますか？',choices:['条件に合う要素だけ残した配列を作る','並べ替える','合計を出す','逆順にする'],a:0,cat:'JS構文'},
  {q:'配列の「.forEach()」は何をしますか？',choices:['全要素に対して順番に処理を行う','最初の1つだけ処理する','要素を消す','配列を結合する'],a:0,cat:'JS構文'},
  {q:'「if文」とは何ですか？',choices:['条件によって処理を分ける書き方','繰り返しの書き方','関数の定義','変数の宣言'],a:0,cat:'JS構文'},
  {q:'「for文」とは何ですか？',choices:['決まった回数だけ処理を繰り返す書き方','条件分岐','関数の呼び出し','エラー処理'],a:0,cat:'JS構文'},
  {q:'「===」と「==」の違いはどれですか？',choices:['===は型も含めて厳密に等しいか比べる','===は代入、==は比較','違いはない','===は文字専用'],a:0,cat:'JS構文'},
  {q:'「null」と「undefined」のおおまかな違いはどれですか？',choices:['nullは意図的に空、undefinedは未定義（まだ値なし）','まったく同じ','nullは数値、undefinedは文字','undefinedはエラー'],a:0,cat:'JS構文'},
  {q:'「true / false」とは何ですか？',choices:['正しい・正しくないを表す値（真偽値）','数字の1と0専用','文字列の一種','エラーの状態'],a:0,cat:'JS構文'},
  {q:'「return」は関数で何をしますか？',choices:['処理結果を呼び出し元へ返す','繰り返しを止める','変数を消す','画面を戻す'],a:0,cat:'JS構文'},
  {q:'「引数（ひきすう）」とは何ですか？',choices:['関数に渡す入力の値','関数が返す結果','エラーの番号','配列の長さ'],a:0,cat:'JS構文'},
  {q:'「戻り値」とは何ですか？',choices:['関数が処理して返してくる結果','関数に渡す値','変数の名前','コメント文'],a:0,cat:'JS構文'},
  {q:'JSの「+」は文字列同士だと何になりますか？',choices:['つなげて1つの文字列にする（連結）','足し算でエラー','無視される','大文字化する'],a:0,cat:'JS構文'},
  {q:'「変数」とは何ですか？',choices:['値に名前をつけて入れておく箱','固定された数字','関数の別名','エラーの種類'],a:0,cat:'JS構文'},
  {q:'「JSON.parse()」は何をしますか？',choices:['JSON文字列をプログラムで扱える形に変換する','JSONを文字列にする','JSONを消す','JSONを暗号化する'],a:0,cat:'JS構文'},
  {q:'「JSON.stringify()」は何をしますか？',choices:['データをJSON形式の文字列に変換する','JSONを読み込む','JSONを検証する','JSONを圧縮する'],a:0,cat:'JS構文'},
  {q:'「try / catch」とは何のための書き方ですか？',choices:['エラーが起きても止まらず対処するため','繰り返すため','条件分岐のため','高速化のため'],a:0,cat:'JS構文'},
  {q:'「querySelector」は何をしますか？',choices:['HTMLの中から指定した部品を取り出す','データを検索する','並べ替える','色を変える'],a:0,cat:'JS構文'},
  {q:'「addEventListener」は何をしますか？',choices:['クリックなどの動作に処理を結びつける','要素を追加する','イベントを消す','音を鳴らす'],a:0,cat:'JS構文'},
  {q:'「文字列（String）」とは何ですか？',choices:['文字を並べたデータ（"あいう" など）','数字専用のデータ','真偽の値','配列の別名'],a:0,cat:'JS構文'},
  {q:'「数値（Number）」とは何ですか？',choices:['計算に使える数のデータ','文字のデータ','真偽の値','日付専用'],a:0,cat:'JS構文'},
  {q:'「.length」は配列・文字列で何を返しますか？',choices:['要素数や文字数（長さ）','合計値','先頭の値','型の名前'],a:0,cat:'JS構文'},
  {q:'「インデックス（添字）」は配列で普通いくつから始まりますか？',choices:['0から','1から','-1から','好きな数から'],a:0,cat:'JS構文'},
  {q:'「Math.random()」は何を返しますか？',choices:['0以上1未満のランダムな数','必ず整数の乱数','現在時刻','円周率'],a:0,cat:'JS構文'},
  {q:'「.push()」は配列で何をしますか？',choices:['末尾に要素を追加する','先頭を消す','並べ替える','長さを返す'],a:0,cat:'JS構文'},
  {q:'「三項演算子（条件 ? A : B）」とは何ですか？',choices:['条件で値を2択するif文の短い書き方','3つの数の計算','3回繰り返す書き方','3択クイズの記号'],a:0,cat:'JS構文'},
  {q:'「&&」と「||」はおおまかに何ですか？',choices:['&&はかつ、||はまたは の論理の記号','足し算と引き算','代入の記号','比較専用記号'],a:0,cat:'JS構文'},

  // ===== データ表現（追加）=====
  {q:'「CSV」とは何ですか？',choices:['値をカンマ区切りで並べた表データの形式','画像の形式','圧縮ファイル','音声形式'],a:0,cat:'データ表現'},
  {q:'「YAML」とは何ですか？',choices:['設定などを人が読みやすく書けるデータ形式','動画の形式','暗号方式','表計算ソフト'],a:0,cat:'データ表現'},
  {q:'「Markdown」とは何ですか？',choices:['記号で見出しや太字を簡単に書ける文章記法','値下げのこと','画像形式','暗号化方式'],a:0,cat:'データ表現'},
  {q:'Markdownで見出し（H1）を作る記号はどれですか？',choices:['# 半角シャープ','* アスタリスク','> 不等号','- ハイフン'],a:0,cat:'データ表現'},
  {q:'Markdownで太字にする記号はどれですか？',choices:['**文字** のようにアスタリスク2つで囲む','__一重アンダーバー__','##文字##','//文字//'],a:0,cat:'データ表現'},
  {q:'「拡張子」とは何ですか？',choices:['ファイル名の最後の.以降で種類を示す部分','ファイルの容量','保存場所','作成者名'],a:0,cat:'データ表現'},
  {q:'「.txt」ファイルとは何ですか？',choices:['装飾のない素の文字だけのファイル','画像ファイル','音声ファイル','実行ファイル'],a:0,cat:'データ表現'},
  {q:'「バイナリ」とは何ですか？',choices:['人が直接読めない、機械向けの0と1のデータ','文字だけのファイル','二人用のこと','二択のこと'],a:0,cat:'データ表現'},
  {q:'「テキストファイル」と「バイナリファイル」の違いはどれですか？',choices:['テキストは文字で読める、バイナリは機械向けで読めない','容量が違うだけ','色が違うだけ','保存先が違うだけ'],a:0,cat:'データ表現'},
  {q:'「ビット」と「バイト」の関係はどれですか？',choices:['8ビットで1バイト','1ビットで8バイト','同じ意味','100ビットで1バイト'],a:0,cat:'データ表現'},
  {q:'「16進数」とは何ですか？',choices:['0〜9とA〜Fで数を表す方式（色コード等で使う）','16倍する計算','16桁の暗号','西暦の表記'],a:0,cat:'データ表現'},
  {q:'色の「#FF0000」はおおよそ何色ですか？',choices:['赤','青','緑','黒'],a:0,cat:'データ表現'},
  {q:'「URL」とは何ですか？',choices:['Web上の住所（場所を示す文字列）','ファイルの容量','暗号の鍵','保存形式'],a:0,cat:'データ表現'},
  {q:'「パス（path）」とは何ですか？',choices:['ファイルやフォルダの場所を示す住所','合言葉','通り道の権利','許可証'],a:0,cat:'データ表現'},
  {q:'「絶対パス」と「相対パス」の違いはどれですか？',choices:['絶対は起点から全部、相対は今いる場所からの道順','絶対は速い、相対は遅い','意味は同じ','絶対は短い'],a:0,cat:'データ表現'},
  {q:'「XML」とは何ですか？',choices:['タグでデータの構造を表す形式','画像形式','圧縮形式','音声形式'],a:0,cat:'データ表現'},
  {q:'「ZIP」とは何ですか？',choices:['複数ファイルをまとめて圧縮する形式','画像形式','暗号方式','文章形式'],a:0,cat:'データ表現'},
  {q:'「メタデータ」とは何ですか？',choices:['データそのものを説明する付帯情報（日時・作者など）','偽のデータ','巨大なデータ','壊れたデータ'],a:0,cat:'データ表現'},
  {q:'「エスケープ」とは文字列で何ですか？',choices:['特別な意味を持つ文字を、ただの文字として扱わせること','文字を消すこと','脱出ゲーム','暗号化'],a:0,cat:'データ表現'},
  {q:'「半角」と「全角」の違いはどれですか？',choices:['文字の幅が違い、別の文字として扱われることがある','色が違う','大きさだけの見た目の差','意味は同じ'],a:0,cat:'データ表現'},

  // ===== Web/PWA（追加）=====
  {q:'「HTML」とは何ですか？',choices:['Webページの骨組み（構造）を作る言語','装飾を担当する言語','計算をする言語','画像の形式'],a:0,cat:'Web/PWA'},
  {q:'「CSS」とは何ですか？',choices:['見た目（色・配置・大きさ）を整える仕組み','計算をする言語','データ保存形式','通信の規格'],a:0,cat:'Web/PWA'},
  {q:'「JavaScript」とは何ですか？',choices:['Webページに動きや処理を加える言語','Javaの簡易版','画像形式','保存形式'],a:0,cat:'Web/PWA'},
  {q:'「ブラウザ」とは何ですか？',choices:['Webページを見るためのソフト','保存ソフト','ウイルス対策ソフト','文章作成ソフト'],a:0,cat:'Web/PWA'},
  {q:'「デベロッパーツール（F12）」とは何ですか？',choices:['Webページの中身やエラーを調べる開発者用の画面','ゲームの裏技','保存メニュー','印刷設定'],a:0,cat:'Web/PWA'},
  {q:'「コンソール」とは何ですか？',choices:['エラーやログを表示・確認する画面','ゲーム機','操作卓の絵','保存先'],a:0,cat:'Web/PWA'},
  {q:'「レスポンシブ」とは何ですか？',choices:['画面幅に応じて見た目が自動で整うこと','反応が速いこと','返信機能','録画機能'],a:0,cat:'Web/PWA'},
  {q:'「オフライン対応」とは何ですか？',choices:['ネットが無くてもアプリが使える状態','電源を切ること','機内モード専用','低速モード'],a:0,cat:'Web/PWA'},
  {q:'「マニフェスト（manifest.json）」はPWAで何ですか？',choices:['アプリ名やアイコンなどホーム追加用の設定ファイル','乗客名簿','エラーログ','暗号鍵'],a:0,cat:'Web/PWA'},
  {q:'「ホーム画面に追加」でPWAは何になりますか？',choices:['普通のアプリのようにアイコンから起動できる','ただのブックマーク','壁紙','ショートカット動画'],a:0,cat:'Web/PWA'},
  {q:'「HTTPS」の「S」は主に何を意味しますか？',choices:['通信が暗号化されて安全（Secure）であること','速い（Speed）','保存（Save）','検索（Search）'],a:0,cat:'Web/PWA'},
  {q:'「Cookie」とは何ですか？',choices:['ブラウザに小さな情報を保存しておく仕組み','お菓子のページ','広告の種類','ウイルス'],a:0,cat:'Web/PWA'},
  {q:'「タップ」と「クリック」の違いはどれですか？',choices:['タップは指で触れる操作、クリックはマウスで押す操作','まったく同じ','タップはPC専用','クリックはスマホ専用'],a:0,cat:'Web/PWA'},
  {q:'「DOM」とはWebで何ですか？',choices:['HTMLを部品の木構造として扱う仕組み','ドーム球場','保存形式','通信規格'],a:0,cat:'Web/PWA'},
  {q:'「id」と「class」のおおまかな違いはどれですか？',choices:['idはページで1つ、classは複数に付けられる目印','色が違う','大きさが違う','意味は同じ'],a:0,cat:'Web/PWA'},
  {q:'Webページの「読み込みが遅い」原因になりやすいのはどれですか？',choices:['画像やファイルのサイズが大きい','文字数が多い','背景が白い','タイトルが長い'],a:0,cat:'Web/PWA'},
  {q:'「フロントエンド」とは何ですか？',choices:['利用者が直接見て触れる画面側','裏側のデータ処理','受付の人','正面入口'],a:0,cat:'Web/PWA'},
  {q:'「バックエンド」とは何ですか？',choices:['画面の裏でデータ処理や保存を担う側','背中のこと','裏口','予備の画面'],a:0,cat:'Web/PWA'},

  // ===== AI・開発のやり取りで出る言葉（追加）=====
  {q:'「コミット」とは開発で何ですか？',choices:['変更を一区切りとして記録すること','約束すること','削除すること','送信すること'],a:0,cat:'AI・開発'},
  {q:'「バックアップ」とは何ですか？',choices:['万一に備えてデータの控えを取っておくこと','後退すること','応援すること','削除の取り消し'],a:0,cat:'AI・開発'},
  {q:'「ログ」とは何ですか？',choices:['処理の記録（何が起きたかの履歴）','丸太のこと','ログインの略','エラーの別名'],a:0,cat:'AI・開発'},
  {q:'「コンソールログ（console.log）」は何のために使いますか？',choices:['途中の値を表示して動作を確かめるため','音を鳴らすため','保存のため','印刷のため'],a:0,cat:'AI・開発'},
  {q:'「環境（開発環境・本番環境）」とは何ですか？',choices:['プログラムを動かす場所や設定のまとまり','自然環境','部屋の温度','机の周り'],a:0,cat:'AI・開発'},
  {q:'「依存（ライブラリの依存）」とは何ですか？',choices:['そのプログラムが動くのに必要な他の部品','人に頼ること','甘えること','借金のこと'],a:0,cat:'AI・開発'},
  {q:'「ライブラリ」とは何ですか？',choices:['よく使う機能をまとめた再利用できる部品集','図書館の予約','保存先','エラー集'],a:0,cat:'AI・開発'},
  {q:'「アップデート」とは何ですか？',choices:['より新しい版に更新すること','削除すること','再起動すること','保存すること'],a:0,cat:'AI・開発'},
  {q:'「バージョン」とは何ですか？',choices:['ソフトの版（更新ごとに番号が上がる）','種類のこと','容量のこと','作者名'],a:0,cat:'AI・開発'},
  {q:'「インストール」とは何ですか？',choices:['ソフトを使えるようにパソコンへ入れること','削除すること','起動すること','保存すること'],a:0,cat:'AI・開発'},
  {q:'「実行（Run）」とは何ですか？',choices:['プログラムを動かすこと','編集すること','保存すること','印刷すること'],a:0,cat:'AI・開発'},
  {q:'「変数名」をわかりやすくする利点はどれですか？',choices:['後で読んだ時に何の値か分かりやすい','処理が速くなる','容量が減る','エラーが消える'],a:0,cat:'AI・開発'},
  {q:'「コメントを書く」主な目的はどれですか？',choices:['後で人が読んで理解しやすくするため','処理を速くするため','容量を増やすため','色をつけるため'],a:0,cat:'AI・開発'},
  {q:'「エラーメッセージ」を読むのが大事な理由はどれですか？',choices:['どこで何が悪いかのヒントが書いてあるから','怒られているだけだから','無視してよいから','広告だから'],a:0,cat:'AI・開発'},
  {q:'「再現性（バグの）」とは何ですか？',choices:['同じ手順でまた同じ不具合が起こせること','二度と起きないこと','録画のこと','再起動のこと'],a:0,cat:'AI・開発'},
  {q:'「上書き保存」と「名前を付けて保存」の違いはどれですか？',choices:['上書きは元を更新、名前付きは別ファイルで残す','まったく同じ','上書きは速いだけ','名前付きは消える'],a:0,cat:'AI・開発'},
  {q:'「クリップボード」とは何ですか？',choices:['コピーした内容を一時的に持っておく場所','保存フォルダ','下敷きのこと','ゴミ箱'],a:0,cat:'AI・開発'},
  {q:'AIにコードを直してもらう時、貼ると良いのはどれですか？',choices:['エラーメッセージと該当部分のコード','感想だけ','ファイル名だけ','スクリーンショットの説明なし'],a:0,cat:'AI・開発'},
  {q:'「動かない」とAIに伝える時、効果的なのはどれですか？',choices:['何をしたら何が起きたか具体的に書く','とにかく動かないと書く','怒って書く','短く一言だけ'],a:0,cat:'AI・開発'},
  {q:'「テスト」とは開発で何ですか？',choices:['想定通り動くか確かめる作業','試験勉強のこと','削除のこと','保存のこと'],a:0,cat:'AI・開発'},
  {q:'「スコープ（変数の）」とは何ですか？',choices:['その変数が使える有効範囲','望遠鏡','予定範囲','保存容量'],a:0,cat:'AI・開発'},
  {q:'「グローバル」と「ローカル」（変数の）の違いはどれですか？',choices:['グローバルはどこでも、ローカルは限られた範囲で使える','色が違う','速さが違う','意味は同じ'],a:0,cat:'AI・開発'},
  {q:'「ハードコード」とは何ですか？',choices:['値を直接コードに書き込んでしまうこと','硬い素材のこと','高速処理のこと','暗号化のこと'],a:0,cat:'AI・開発'},
  {q:'「コピペ（コピー&ペースト）」とは何ですか？',choices:['内容を複写して別の場所に貼ること','削除すること','印刷すること','保存すること'],a:0,cat:'AI・開発'},
  {q:'「フォルダ」と「ファイル」の関係はどれですか？',choices:['フォルダはファイルを入れる入れ物','まったく同じもの','ファイルがフォルダを入れる','無関係'],a:0,cat:'AI・開発'},
  {q:'「同期（シンク）」とは何ですか？',choices:['複数の場所のデータを同じ状態にそろえること','音を合わせること','時計を見ること','削除すること'],a:0,cat:'AI・開発'},
  {q:'OneDriveなどで「競合」が起きるのはどんな時ですか？',choices:['同じファイルを別々に編集して食い違った時','容量が空いた時','ネットが速い時','保存しない時'],a:0,cat:'AI・開発'},

  // ===== 追加（200問到達分）AI用語中心 =====
  {q:'AIに「箇条書きで」と頼むと良い場面はどれですか？',choices:['要点を短く並べて見たいとき','長文の物語が欲しいとき','謝ってほしいとき','計算したいとき'],a:0,cat:'AI用語'},
  {q:'「コーパス」とはAIで何ですか？',choices:['学習に使う大量の文章データの集まり','体のこと','保存形式','エラー集'],a:0,cat:'AI用語'},
  {q:'「トークン上限に達した」とはどういう状態ですか？',choices:['一度に扱える文章量の限界を超えたこと','料金切れ','通信切断','保存失敗'],a:0,cat:'AI用語'},
  {q:'AIに同じ質問をして答えを比べるのは何のためですか？',choices:['ばらつきや信頼性を確かめるため','料金を使うため','遅くするため','保存のため'],a:0,cat:'AI用語'},
  {q:'「プロンプトを分割する」と良い場面はどれですか？',choices:['作業が複雑で一度に頼むと精度が落ちるとき','急いでいるとき','料金を上げたいとき','短い質問のとき'],a:0,cat:'AI用語'},
  {q:'AIの「自信ありげな間違い」に注意すべき理由はどれですか？',choices:['断定的でも事実と違うことがあるから','声が大きいから','長文だから','速いから'],a:0,cat:'AI用語'},
  {q:'「ナレッジベース」とは何ですか？',choices:['調べごとの元になる知識・資料のまとまり','基地のこと','保存ボタン','エラー一覧'],a:0,cat:'AI用語'},
  {q:'AIに専門用語の説明を頼む時のコツはどれですか？',choices:['誰向け・どれくらい簡単にかを指定する','専門用語で頼む','長く書く','何度も送る'],a:0,cat:'AI用語'},
  {q:'「出力フォーマットを指定する」利点はどれですか？',choices:['そのまま使える形で答えが返りやすい','料金が下がる','速くなる','保存が要らない'],a:0,cat:'AI用語'},
  {q:'AIが画像を「見て」答えられるのは何のおかげですか？',choices:['画像も扱えるマルチモーダルだから','カメラが付いているから','検索しているから','録画しているから'],a:0,cat:'AI用語'},
  {q:'「会話履歴をリセットする」とどうなりますか？',choices:['それまでの文脈を忘れて最初から扱う','料金が戻る','速くなる','保存される'],a:0,cat:'AI用語'},
  {q:'AIに長い資料を渡す時の注意点はどれですか？',choices:['多すぎると上限を超えたり精度が落ちることがある','必ず速くなる','料金が無料になる','音が出る'],a:0,cat:'AI用語'},
  {q:'「制約（〜してはいけない）」を指示に入れる利点はどれですか？',choices:['望まない答えを避けやすくなる','料金が下がる','処理が速い','保存が楽'],a:0,cat:'AI用語'},
  {q:'「サマリー（要約）」とは何ですか？',choices:['長い内容を短くまとめたもの','合計金額','保存形式','エラー一覧'],a:0,cat:'AI用語'},
  {q:'AIに「根拠も書いて」と頼む利点はどれですか？',choices:['なぜその答えかを確認しやすい','料金が下がる','速くなる','短くなる'],a:0,cat:'AI用語'},
  {q:'「プロンプトテンプレート」とは何ですか？',choices:['よく使う指示文をひな形にして使い回すもの','保存形式','料金プラン','エラー集'],a:0,cat:'AI用語'},
  {q:'AIの回答が長すぎる時の対処はどれですか？',choices:['「200字以内で」など長さを指定する','怒る','何度も送る','閉じる'],a:0,cat:'AI用語'},
  {q:'「文脈を保つ」とAIで何が良いですか？',choices:['前の話を踏まえた自然な続きが返る','料金が下がる','速くなる','保存される'],a:0,cat:'AI用語'},
  {q:'AIに表計算の式を作ってもらう時に伝えると良いのはどれですか？',choices:['対象の列や条件を具体的に書く','感想だけ','ファイル名だけ','とにかく作ってと言う'],a:0,cat:'AI用語'},
  {q:'「日本語で答えて」と指定する利点はどれですか？',choices:['言語を明示して意図通りの出力にできる','料金が下がる','速くなる','保存できる'],a:0,cat:'AI用語'},
  {q:'AIを仕事で使う時の基本姿勢として適切なのはどれですか？',choices:['答えを確認しつつ道具として活用する','すべて丸ごと信じる','一切使わない','秘密の情報も気にせず貼る'],a:0,cat:'AI用語'},
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
