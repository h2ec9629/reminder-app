'use strict';
// === CAMERA（アプリ内カメラ。2026-10-29追加） ===
// ホーム画面2ページ目の「カメラ」キーから開く。iPhoneの純正カメラは外のアプリから呼び出せないため自作した。
// 撮った写真は自動では写真アプリに入らないので、「保存・共有」→共有シートの「画像を保存」で保存する。
let _camStream = null;
let _camFacing = 'environment'; // environment=背面 / user=前面
let _camBlob   = null;          // 直前に撮った写真（保存・共有用）
let _camUrl    = null;          // 確認表示用のURL（撮り直し・閉じる時に解放）

function _camView() { return document.getElementById('camView'); }

async function openCamera() {
  _camView().classList.remove('hide', 'review');
  await startCamStream();
}
function closeCamera() {
  stopCamStream();
  clearCamShot();
  _camView().classList.add('hide');
}

async function startCamStream() {
  stopCamStream();
  const msg = document.getElementById('camMsg');
  msg.textContent = '';
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    msg.textContent = 'この環境ではカメラを使えません';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: _camFacing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
      audio: false,
    });
    // 起動待ちの間に閉じられていたら、カメラを掴んだままにしない
    if (_camView().classList.contains('hide')) { stream.getTracks().forEach(t => t.stop()); return; }
    _camStream = stream;
    const v = document.getElementById('camVideo');
    v.srcObject = stream;
    v.classList.toggle('mirror', _camFacing === 'user');
    await v.play().catch(() => {});
  } catch (e) {
    msg.textContent = (e && e.name === 'NotAllowedError')
      ? 'カメラの使用が許可されていません。\n設定アプリでカメラへのアクセスを許可してください。'
      : 'カメラを起動できませんでした';
  }
}
function stopCamStream() {
  if (_camStream) { _camStream.getTracks().forEach(t => t.stop()); _camStream = null; }
  const v = document.getElementById('camVideo');
  if (v) v.srcObject = null;
}
function flipCamera() {
  _camFacing = _camFacing === 'environment' ? 'user' : 'environment';
  startCamStream();
}

function takePhoto() {
  const v = document.getElementById('camVideo');
  if (!_camStream || !v.videoWidth) return;
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);

  const f = document.getElementById('camFlash'); // シャッターの白フラッシュ演出
  f.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));

  c.toBlob(b => {
    if (!b) { showToast('撮影に失敗しました'); return; }
    clearCamShot();
    _camBlob = b;
    _camUrl  = URL.createObjectURL(b);
    document.getElementById('camShot').src = _camUrl;
    _camView().classList.add('review'); // 映像は止めずに隠すだけ（撮り直しをすぐできるように）
  }, 'image/jpeg', 0.92);
}
function retakePhoto() {
  clearCamShot();
  _camView().classList.remove('review');
}
function clearCamShot() {
  if (_camUrl) URL.revokeObjectURL(_camUrl);
  _camUrl = null; _camBlob = null;
  document.getElementById('camShot').removeAttribute('src');
}

// iPhoneは共有シート経由（「画像を保存」で写真アプリへ）。共有できない環境はファイルとしてダウンロード
async function savePhoto() {
  if (!_camBlob) return;
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const name = `IMG_${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.jpg`;
  const file = new File([_camBlob], name, { type: 'image/jpeg' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); } catch (e) { /* キャンセル時は何もしない */ }
    return;
  }
  const a = document.createElement('a');
  a.href = _camUrl; a.download = name; a.click();
}

// アプリを裏に回したらカメラを離し、戻ってきたら再開する（確認中なら撮り直し時に映像が要るので同じく再開）
document.addEventListener('visibilitychange', () => {
  const view = _camView();
  if (!view || view.classList.contains('hide')) return;
  if (document.hidden) stopCamStream();
  else startCamStream();
});
