// === CALENDAR ===
const JP_HOLIDAYS = {
  '2025-01-01':'元日','2025-01-13':'成人の日','2025-02-11':'建国記念日',
  '2025-02-23':'天皇誕生日','2025-02-24':'振替休日','2025-03-20':'春分の日',
  '2025-04-29':'昭和の日','2025-05-03':'憲法記念日','2025-05-04':'みどりの日',
  '2025-05-05':'こどもの日','2025-05-06':'振替休日','2025-07-21':'海の日',
  '2025-08-11':'山の日','2025-09-15':'敬老の日','2025-09-23':'秋分の日',
  '2025-10-13':'スポーツの日','2025-11-03':'文化の日','2025-11-23':'勤労感謝の日',
  '2025-11-24':'振替休日',
  '2026-01-01':'元日','2026-01-12':'成人の日','2026-02-11':'建国記念日',
  '2026-02-23':'天皇誕生日','2026-03-20':'春分の日','2026-04-29':'昭和の日',
  '2026-05-03':'憲法記念日','2026-05-04':'みどりの日','2026-05-05':'こどもの日',
  '2026-05-06':'振替休日','2026-07-20':'海の日','2026-08-11':'山の日',
  '2026-09-21':'敬老の日','2026-09-23':'秋分の日','2026-10-12':'スポーツの日',
  '2026-11-03':'文化の日','2026-11-23':'勤労感謝の日',
};

let _calYear  = new Date().getFullYear();
let _calMonth = new Date().getMonth();
let _calSelected = null;

function calPrev() { _calMonth--; if(_calMonth<0){_calMonth=11;_calYear--;} renderCalendar(); }
function calNext() { _calMonth++; if(_calMonth>11){_calMonth=0;_calYear++;} renderCalendar(); }

function renderCalendar() {
  const label = document.getElementById('calMonthLabel');
  label.textContent = `${_calYear}年${_calMonth+1}月`;

  const reminders   = getAll().filter(r => !r.completed && r.deadline);
  const acItems     = (_excelSchedule&&_excelSchedule.ac_side)||[];
  const adItems     = (_excelSchedule&&_excelSchedule.ad_side)||[];
  const todayISO    = todayStr();

  // 月の最初・最後
  const firstDay = new Date(_calYear, _calMonth, 1).getDay();
  const lastDate  = new Date(_calYear, _calMonth+1, 0).getDate();

  const DOW = ['日','月','火','水','木','金','土'];
  let html = DOW.map((d,i) => `<div class="cal-dow">${d}</div>`).join('');

  // 前月の空白
  for(let i=0;i<firstDay;i++) {
    const d = new Date(_calYear, _calMonth, -firstDay+i+1);
    html += calCell(d, true, todayISO, reminders, acItems, adItems);
  }
  // 当月
  for(let d=1;d<=lastDate;d++) {
    const dt = new Date(_calYear, _calMonth, d);
    html += calCell(dt, false, todayISO, reminders, acItems, adItems);
  }
  // 後月の空白（6行目を埋める）
  const total = firstDay + lastDate;
  const remainder = total % 7 === 0 ? 0 : 7 - (total % 7);
  for(let i=1;i<=remainder;i++) {
    const dt = new Date(_calYear, _calMonth+1, i);
    html += calCell(dt, true, todayISO, reminders, acItems, adItems);
  }

  document.getElementById('calGrid').innerHTML = html;
  if(_calSelected) renderCalDetail(_calSelected, reminders, acItems, adItems);
  else document.getElementById('calDetail').innerHTML = '';
}

function isoOf(dt) {
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
}

function calCell(dt, otherMonth, todayISO, reminders, acItems, adItems) {
  const iso  = isoOf(dt);
  const dow  = dt.getDay();
  const isToday = iso === todayISO;
  const isSel   = iso === _calSelected;
  const hol     = JP_HOLIDAYS[iso];

  const hasRemUrgent = reminders.some(r => r.deadline===iso && daysUntil(r.deadline)<=2);
  const hasRemSoon   = reminders.some(r => r.deadline===iso && daysUntil(r.deadline)>2 && daysUntil(r.deadline)<=7);
  const hasRemLater  = reminders.some(r => r.deadline===iso && daysUntil(r.deadline)>7);
  const hasAc        = acItems.some(i => i.date===iso);
  const hasAd        = adItems.some(i => i.date===iso);

  let dots = '';
  if(hasRemUrgent) dots += '<span class="cal-dot cal-dot-r"></span>';
  if(hasRemSoon)   dots += '<span class="cal-dot cal-dot-s"></span>';
  if(hasRemLater)  dots += '<span class="cal-dot cal-dot-ok"></span>';
  if(hasAc)        dots += '<span class="cal-dot cal-dot-ac"></span>';
  if(hasAd)        dots += '<span class="cal-dot cal-dot-ad"></span>';
  if(hol)          dots += '<span class="cal-dot cal-dot-h"></span>';

  const numCls = hol||dow===0 ? 'cal-num hol' : dow===6 ? 'cal-num sat' : 'cal-num';
  const cellCls = ['cal-cell', otherMonth?'other-month':'', isToday?'today':'', isSel?'selected':''].filter(Boolean).join(' ');

  return `<div class="${cellCls}" onclick="calSelectDate('${iso}')">
    <span class="${numCls}">${dt.getDate()}</span>
    <div class="cal-dots">${dots}</div>
  </div>`;
}

function calSelectDate(iso) {
  _calSelected = _calSelected===iso ? null : iso;
  const reminders = getAll().filter(r => !r.completed && r.deadline);
  const acItems   = (_excelSchedule&&_excelSchedule.ac_side)||[];
  const adItems   = (_excelSchedule&&_excelSchedule.ad_side)||[];
  document.querySelectorAll('.cal-cell').forEach(el => el.classList.remove('selected'));
  if(_calSelected) {
    document.querySelectorAll('.cal-cell').forEach(el => {
      if(el.getAttribute('onclick')===`calSelectDate('${iso}')`) el.classList.add('selected');
    });
    renderCalDetail(iso, reminders, acItems, adItems);
  } else {
    document.getElementById('calDetail').innerHTML = '';
  }
}

function renderCalDetail(iso, reminders, acItems, adItems) {
  const dt  = new Date(iso+'T00:00:00');
  const hol = JP_HOLIDAYS[iso];
  const dayRems = reminders.filter(r => r.deadline===iso);
  const dayAc   = acItems.filter(i => i.date===iso);
  const dayAd   = adItems.filter(i => i.date===iso);
  const total   = dayRems.length + dayAc.length + dayAd.length + (hol?1:0);

  let html = `<div class="cal-detail">
    <div class="cal-detail-hd">${fmtDateStr(iso)}${hol ? `　<span style="font-size:11px;color:var(--purple);">🟣 ${hol}</span>` : ''}</div>`;

  if(total===0) {
    html += '<div class="cal-detail-empty">この日の予定はありません</div>';
  } else {
    if(hol) html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="background:var(--purple-dim);color:#A78BFA;">祝日</span><span style="color:var(--text);">${hol}</span></div>`;
    dayAc.forEach(i => {
      html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="background:var(--warning-dim);color:#FBB040;">引取</span><span style="color:var(--text);">${escH(i.ag||'')}</span></div>`;
    });
    dayAd.forEach(i => {
      html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="background:var(--success-dim);color:#4ADE80;">納品</span><div><div style="color:var(--text);">${escH(i.d||'')}</div>${i.s||i.u?`<div style="font-size:11px;color:var(--text-sub);">${escH([i.s,i.u].filter(Boolean).join(' · '))}</div>`:''}  </div></div>`;
    });
    dayRems.forEach(r => {
      const n = daysUntil(r.deadline);
      const tagColor = n<0 ? 'background:var(--purple-dim);color:#A78BFA;'
                     : n<=2 ? 'background:var(--danger-dim);color:#F87171;'
                     : n<=7 ? 'background:var(--warning-dim);color:#FBB040;'
                     : 'background:var(--surface-2);color:var(--text-sub);';
      html += `<div class="cal-detail-row"><span class="cal-detail-tag" style="${tagColor}">期限</span><div><div style="color:var(--text);">${escH(r.title)}</div>${r.notes?`<div style="font-size:11px;color:var(--text-sub);">${escH(r.notes)}</div>`:''}</div></div>`;
    });
  }

  html += '</div>';
  document.getElementById('calDetail').innerHTML = html;
}

// === GANTT ===
function abbrevName(n) {
  if (/^採光ルーバー/.test(n)) return 'ルーバーB';
  if (/^灯具/.test(n)) { const m = n.match(/L=[\d.]+/); return '灯具' + (m ? ' ' + m[0] : ''); }
  if (/^8FL/.test(n))  { const m = n.match(/L=[\d.]+/); return '8FL' + (m ? ' ' + m[0] : ''); }
  return n;
}

function renderGantt() {
  const SC = 9;
  const LW = 200;

  let d2h = {
    '2026-05-11':-40,'2026-05-12':-32,'2026-05-13':-24,'2026-05-14':-16,
    '2026-05-16':0,  '2026-05-18':8,  '2026-05-19':16, '2026-05-20':24,
    '2026-05-21':32, '2026-05-22':40, '2026-05-25':48, '2026-05-26':56,
    '2026-05-27':64, '2026-05-28':72, '2026-05-29':80,
    '2026-06-01':88, '2026-06-02':96, '2026-06-03':104,'2026-06-04':112,
    '2026-06-05':120,'2026-06-08':128,'2026-06-09':136,'2026-06-10':144,
    '2026-06-11':152,'2026-06-12':160,'2026-06-15':168,'2026-06-16':176,
    '2026-06-17':184,'2026-06-18':192,'2026-06-19':200,
    '2026-06-22':208,'2026-06-23':216,'2026-07-02':272
  };
  if (_ganttData && _ganttData.d2h) d2h = _ganttData.d2h;
  const _posVals = Object.values(d2h).filter(v => v >= 0);
  const chartStartH = _posVals.length > 0 ? Math.min(..._posVals) : 0;

  const _td = new Date(); const TODAY_ISO = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
  const TODAY_H = (function() {
    if (d2h[TODAY_ISO] !== undefined) return d2h[TODAY_ISO];
    const keys = Object.keys(d2h).sort();
    let prev = null, next = null;
    for (const k of keys) { if (k <= TODAY_ISO) prev = k; else if (!next) next = k; }
    if (!prev) return d2h[keys[0]];
    if (!next)  return d2h[keys[keys.length-1]];
    const frac = (new Date(TODAY_ISO)-new Date(prev))/(new Date(next)-new Date(prev));
    return d2h[prev] + Math.round(frac*(d2h[next]-d2h[prev]));
  })();

  let D = [
    {n:"灯具カバーPC IN 2050　L=1183.5",b:"灯具",s:"2026-05-20",e:"2026-05-26",k:"2026-05-28",u:192,w:128,y:2.0,z:2.0,aa:0,ab:4},
    {n:"灯具カバーPC IN 2110　L=1815",b:"灯具",s:"2026-05-22",e:"2026-05-27",k:"2026-06-04",u:192,w:null,y:8.0,z:10.0,aa:4,ab:12},
    {n:"灯具カバーPC IN 2070　L=1966",b:"灯具",s:"2026-05-22",e:"2026-05-27",k:"2026-06-05",u:192,w:null,y:8.0,z:18.0,aa:12,ab:20},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-26",e:"2026-05-29",k:"2026-05-28",u:2000,w:null,y:11.7647,z:29.7647,aa:20,ab:32},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-05-26",e:"2026-05-29",k:"2026-05-29",u:300,w:null,y:1.6667,z:31.4314,aa:32,ab:32},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-05-26",e:"2026-05-29",k:"2026-05-29",u:300,w:null,y:1.6667,z:33.098,aa:32,ab:36},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-26",e:"2026-06-03",k:"2026-06-04",u:2000,w:null,y:11.7647,z:44.8627,aa:36,ab:48},
    {n:"採光ルーバーパネルB　L=1996",b:"LED",s:"2026-05-27",e:"2026-06-03",k:"2026-06-08",u:378,w:null,y:6.0,z:50.8627,aa:48,ab:52},
    {n:"採光ルーバーパネルB　L=1996",b:"LED",s:"2026-05-07",e:"2026-06-03",k:"2026-06-08",u:42,w:null,y:0.6667,z:51.5294,aa:52,ab:52},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-05-29",e:"2026-06-03",k:"2026-06-08",u:300,w:null,y:2.5,z:54.0294,aa:52,ab:56},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-05-29",e:"2026-06-03",k:"2026-06-08",u:100,w:null,y:0.8333,z:54.8627,aa:56,ab:56},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-05-29",e:"2026-06-05",k:"2026-06-08",u:200,w:null,y:1.6667,z:56.5294,aa:56,ab:60},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-05-29",e:"2026-06-05",k:"2026-06-08",u:100,w:null,y:0.5882,z:57.1176,aa:60,ab:60},
    {n:"8FL281304 8310　L=748",b:"LED",s:"2026-05-29",e:"2026-06-05",k:"2026-06-08",u:400,w:null,y:2.3529,z:59.4706,aa:60,ab:60},
    {n:"灯具カバーPC IN 2130　L=908",b:"灯具",s:"2026-06-01",e:"2026-06-09",k:"2026-06-12",u:208,w:null,y:5.2,z:64.6706,aa:60,ab:68},
    {n:"灯具カバーPC IN 2050　L=1183.5",b:"灯具",s:"2026-06-01",e:"2026-06-09",k:"2026-06-12",u:208,w:null,y:6.5,z:71.1706,aa:68,ab:72},
    {n:"灯具カバーPC IN 2080　L=1540",b:"灯具",s:"2026-06-01",e:"2026-06-09",k:"2026-06-15",u:96,w:null,y:4.0,z:75.1706,aa:72,ab:76},
    {n:"灯具カバーPC IN 2100　L=1923",b:"灯具",s:"2026-06-01",e:"2026-06-09",k:"2026-06-15",u:96,w:null,y:4.0,z:79.1706,aa:76,ab:80},
    {n:"灯具カバーPC IN 2070　L=1966",b:"灯具",s:"2026-06-03",e:"2026-06-10",k:"2026-06-15",u:208,w:null,y:8.6667,z:87.8373,aa:80,ab:88},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:500,w:null,y:4.1667,z:92.0039,aa:88,ab:96},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:100,w:null,y:0.8333,z:92.8373,aa:96,ab:96},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:100,w:null,y:0.8333,z:93.6706,aa:96,ab:96},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:300,w:null,y:1.6667,z:95.3373,aa:96,ab:96},
    {n:"8FL281304 4910　L=592",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:100,w:null,y:0.5556,z:95.8928,aa:96,ab:96},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:200,w:null,y:1.0,z:96.8928,aa:96,ab:100},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:100,w:null,y:0.5,z:97.3928,aa:100,ab:100},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-03",e:"2026-06-10",k:"2026-06-11",u:300,w:null,y:1.5,z:98.8928,aa:100,ab:100},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-03",e:"2026-06-12",k:"2026-06-11",u:600,w:null,y:3.5294,z:102.4222,aa:100,ab:104},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-03",e:"2026-06-12",k:"2026-06-11",u:400,w:null,y:2.3529,z:104.7752,aa:104,ab:108},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-03",e:"2026-06-12",k:"2026-06-11",u:100,w:null,y:0.5882,z:105.3634,aa:108,ab:108},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-09",e:"2026-06-12",k:"2026-06-12",u:1000,w:null,y:5.8824,z:111.2458,aa:108,ab:112},
    {n:"灯具カバーPC IN 2110　L=1815",b:"灯具",s:"2026-06-09",e:"2026-06-16",k:"2026-06-17",u:208,w:null,y:8.6667,z:119.9124,aa:112,ab:120},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-11",e:"2026-06-17",k:"2026-06-12",u:2000,w:null,y:11.7647,z:131.6771,aa:120,ab:132},
    {n:"8FL281304 4810　L=297",b:"LED",s:"2026-06-11",e:"2026-06-17",k:"2026-06-17",u:300,w:null,y:1.5,z:133.1771,aa:132,ab:136},
    {n:"採光ルーバーパネルB　L=1996",b:"LED",s:"2026-05-27",e:"2026-06-19",k:"2026-06-22",u:336,w:null,y:5.3333,z:138.5105,aa:136,ab:140},
    {n:"8FL281304 6110　L=1478",b:"LED",s:"2026-06-11",e:"2026-06-19",k:"2026-06-23",u:400,w:null,y:3.3333,z:141.8438,aa:140,ab:144},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-11",e:"2026-06-19",k:"2026-06-23",u:900,w:null,y:5.2941,z:147.1379,aa:144,ab:148},
    {n:"8FL281304 5010　L=888",b:"LED",s:"2026-06-12",e:"2026-06-22",k:"2026-06-23",u:2000,w:null,y:11.7647,z:158.9026,aa:148,ab:160},
    {n:"8FL281304 8310　L=748",b:"LED",s:"2026-06-12",e:"2026-06-22",k:"2026-06-23",u:400,w:null,y:2.3529,z:161.2556,aa:160,ab:164},
    {n:"752GPSB　865",b:"樹脂",s:"2026-06-16",e:"2026-06-24",k:"2026-07-02",u:200,w:null,y:1.3333,z:162.5889,aa:164,ab:164},
    {n:"752GPSB　715",b:"樹脂",s:"2026-06-16",e:"2026-06-24",k:"2026-07-02",u:800,w:null,y:2.6667,z:165.2556,aa:164,ab:168},
    {n:"752GPSB　665",b:"樹脂",s:"2026-06-16",e:"2026-06-24",k:"2026-07-02",u:100,w:null,y:0.3333,z:165.5889,aa:168,ab:168},
    {n:"752GPSB　565",b:"樹脂",s:"2026-06-16",e:"2026-06-24",k:"2026-07-02",u:1200,w:null,y:4.0,z:169.5889,aa:168,ab:172},
    {n:"752GPSB　415",b:"樹脂",s:"2026-06-16",e:"2026-06-24",k:"2026-07-02",u:2100,w:null,y:7.0,z:176.5889,aa:172,ab:180},
    {n:"752GPSB　265",b:"樹脂",s:"2026-06-16",e:"2026-06-24",k:"2026-07-02",u:600,w:null,y:2.0,z:178.5889,aa:180,ab:180}
  ];
  if (_ganttData && _ganttData.rows && _ganttData.rows.length > 0 && _ganttData.rows[0].y != null) D = _ganttData.rows;
  // 納品日(e)が昨日以前の行を除外（当日・未来・納品日なしはそのまま表示）
  D = D.filter(r => !r.e || r.e >= TODAY_ISO);

  const h2px = h => Math.round(h * SC);
  const halfDayPx    = h2px(4); // 1日の前半・後半の境界（4h = 1マス分）
  const todayOffset = h2px(chartStartH); // Excelで設定したチャート開始点を左端基準にする

  function d2px(iso) {
    if (!iso) return null;
    if (d2h[iso] !== undefined) return h2px(d2h[iso]) - todayOffset;
    const keys = Object.keys(d2h).sort();
    let prev = null, next = null;
    for (const k of keys) { if (k <= iso) prev = k; else if (!next) next = k; }
    if (!prev) return -todayOffset;
    if (!next)  return h2px(d2h[keys[keys.length-1]]) - todayOffset;
    const frac = (new Date(iso)-new Date(prev))/(new Date(next)-new Date(prev));
    return Math.round((d2h[prev]+frac*(d2h[next]-d2h[prev]))*SC) - todayOffset;
  }

  const maxH   = Math.max(...D.map(r=>r.ab), TODAY_H+24);
  const TL     = Math.max((maxH - TODAY_H)*SC+48, 620);
  const todayX = h2px(TODAY_H) - h2px(chartStartH); // 今日の赤線はチャート開始点からの相対位置
  const stickyLbl = `flex:0 0 ${LW}px;position:sticky;left:0;z-index:8;border-right:1px solid var(--border);`;

  const DAYS_JP = ['日','月','火','水','木','金','土'];
  const fullDayPx = halfDayPx * 2;
  const d2hSorted = Object.entries(d2h).filter(([iso,v])=>v>=0).sort((a,b)=>a[1]-b[1]);
  let dayGridLines = '';
  // 今日ラベルをx=0に赤で強制表示（2マス幅）
  const _todayDt = new Date(TODAY_ISO+'T00:00:00');
  const _todayDow = DAYS_JP[_todayDt.getDay()];
  const _todayLbl = `${_todayDt.getMonth()+1}/${_todayDt.getDate()}（${_todayDow}）`;
  let axTicks = `<span style="position:absolute;font-size:10px;color:#E24B4A;font-weight:700;top:3px;left:${todayX+1}px;width:${fullDayPx}px;white-space:nowrap;overflow:hidden;">${_todayLbl}</span>`;
  d2hSorted.forEach(([iso, h]) => {
    const x  = h2px(h) - todayOffset;
    const dt = new Date(iso+'T00:00:00');
    const isMon = dt.getDay()===1, isMth = dt.getDate()===1;
    // 日境界線：月初は青2px・月曜は白45%・通常は白22%・半日線は白7%
    const lineColor = isMth ? '#6B9FD4' : (isMon ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)');
    const lineW     = isMth ? '2' : '1';
    dayGridLines += `<div style="position:absolute;top:0;bottom:0;left:${x}px;width:${lineW}px;background:${lineColor};opacity:1;z-index:1;pointer-events:none;"></div>`;
    // 1日2マス：中間グリッド線（半日）
    dayGridLines += `<div style="position:absolute;top:0;bottom:0;left:${x + halfDayPx}px;width:1px;background:rgba(255,255,255,0.07);opacity:1;z-index:1;pointer-events:none;"></div>`;
    // 今日ラベルと重なる場合はスキップ（グリッド線は残す）
    if (Math.abs(x - todayX) < fullDayPx) return;
    const dow = DAYS_JP[dt.getDay()];
    const lbl = `${dt.getMonth()+1}/${dt.getDate()}（${dow}）`;
    axTicks += `<span style="position:absolute;font-size:10px;color:#fff;top:3px;left:${x+1}px;width:${fullDayPx}px;white-space:nowrap;overflow:hidden;">${lbl}</span>`;
  });

  const todayLine = `<div style="position:absolute;top:0;bottom:0;left:${todayX}px;width:2px;background:#E24B4A;z-index:5;pointer-events:none;"></div>`;
  let html = `<div style="position:relative;display:inline-block;min-width:${LW+TL}px;width:100%;">`;

  html += `<div style="display:flex;height:22px;position:sticky;top:0;z-index:10;border-bottom:1px solid rgba(255,255,255,0.12);">
    <div style="${stickyLbl}background:var(--surface-2);height:22px;z-index:11;"></div>
    <div style="position:relative;flex:1;height:22px;background:var(--surface-2);overflow:hidden;">${dayGridLines}${todayLine}${axTicks}</div>
  </div>`;

  html += `<div style="display:flex;height:22px;position:sticky;top:22px;z-index:9;border-bottom:1px solid rgba(255,255,255,0.12);">
    <div style="${stickyLbl}background:var(--bg-2);height:22px;z-index:10;display:flex;align-items:center;font-size:10px;font-weight:700;color:var(--text-faint);padding:0 5px;">品名 / 依頼・進捗・支給日・納品日・期日</div>
    <div style="position:relative;flex:1;height:22px;background:var(--bg-2);overflow:hidden;">${dayGridLines}${todayLine}</div>
  </div>`;

  let _cascadeOffset = 0;
  let _nextMinX = 0;
  D.forEach((row, rowIdx) => {
    const barColor = row.b==='灯具' ? '#85B7EB' : '#C8C8C8';
    // Y/Zベース・進捗カスケード（4hスナップなし）
    const rowY = row.y || 0;
    const progress = (row.u > 0 && row.w != null) ? Math.min(row.w / row.u, 1.0) : 0;
    const remainY = rowY > 0 ? rowY * (1 - progress) : 0;
    const dispStart = (row.z || 0) - rowY - _cascadeOffset;
    _cascadeOffset += rowY - remainY;
    const rawBarX = h2px(dispStart) - todayOffset;
    const barX = Math.max(_nextMinX, rawBarX);
    _nextMinX = barX + h2px(remainY);
    const barW = h2px(remainY);
    const kX = d2px(row.k);
    // 引取日マーカー: 当日以降 かつ 納品日より前の場合のみ表示（s>e の逆転データは非表示）
    const sX = (row.s && row.s >= TODAY_ISO && (!row.e || row.s <= row.e)) ? d2px(row.s) : null;
    const eX = d2px(row.e);

    let bar = dayGridLines + todayLine;
    // 【上段】バー（top:4px, height:14px）
    bar += `<div style="position:absolute;top:4px;height:14px;left:${barX}px;width:${barW}px;border-radius:3px;background:rgba(160,160,160,0.55);z-index:2;"></div>`;
    // 期日と納品日の重複チェック
    const kOverlapsE = row.k && row.e && row.k === row.e;
    // 【下段】3色マーカー（top:22px〜bottom:4px）
    const mkStyle = `position:absolute;top:22px;height:14px;width:${halfDayPx}px;z-index:4;border-radius:2px;border:1px solid rgba(255,255,255,0.25);`;
    // 納品日（e）: 緑マーカー
    if (eX !== null) {
      if (kOverlapsE) {
        // 期日と重複: 左半分=緑・右半分=赤
        bar += `<div style="${mkStyle}left:${eX + halfDayPx}px;overflow:hidden;"><div style="position:absolute;top:0;bottom:0;left:0;width:50%;background:rgba(74,222,128,0.88);"></div><div style="position:absolute;top:0;bottom:0;right:0;width:50%;background:rgba(220,60,60,0.88);"></div></div>`;
      } else {
        bar += `<div style="${mkStyle}left:${eX + halfDayPx}px;background:rgba(74,222,128,0.85);"></div>`;
      }
    }
    // 支給日（s）: 黄マーカー
    if (sX !== null) {
      bar += `<div style="${mkStyle}left:${sX + halfDayPx}px;background:rgba(244,196,48,0.85);"></div>`;
    }
    // 期日（k）: 赤マーカー
    if (kX !== null && !kOverlapsE) {
      bar += `<div style="${mkStyle}left:${kX + halfDayPx}px;background:rgba(220,60,60,0.85);"></div>`;
    }

    const dispD = iso => iso ? iso.slice(5).replace('-', '/') : '-';
    const uV = row.u != null ? String(row.u) : '-';
    const wV = row.w != null ? String(row.w) : '-';
    html += `<div data-row-idx="${rowIdx}" style="display:flex;height:50px;border-bottom:1px solid rgba(255,255,255,0.12);">
      <div class="gantt-lbl" style="${stickyLbl}background:var(--surface);height:50px;padding:3px 6px;display:flex;flex-direction:column;justify-content:center;gap:4px;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.12);">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:11px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;">${escH(abbrevName(row.n))}</div>
          <div style="font-size:11px;font-weight:600;color:var(--text);white-space:nowrap;padding-left:4px;flex-shrink:0;">${uV} / ${wV}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-size:10px;white-space:nowrap;"><span style="color:#FBB040;font-weight:700;">引</span><span style="color:var(--text-sub);"> ${dispD(row.s)}</span><span style="color:var(--text-faint);"> ・ </span><span style="color:#4ADE80;font-weight:700;">納</span><span style="color:var(--text-sub);"> ${dispD(row.e)}</span></div>
          <div style="font-size:10px;white-space:nowrap;padding-left:4px;"><span style="color:#F87171;font-weight:700;">期</span><span style="color:#F87171;"> ${dispD(row.k)}</span></div>
        </div>
      </div>
      <div class="gantt-chart-area" style="position:relative;flex:1;height:50px;overflow:hidden;">${bar}<div class="gantt-col-hl" style="display:none;position:absolute;top:0;bottom:0;pointer-events:none;"></div></div>
    </div>`;
  });

  html += '</div>';
  const inner = document.getElementById('ganttInner');
  inner.innerHTML = html;
  const outer = document.getElementById('ganttOuter');
  outer.scrollLeft = 0;

  // === ガントチャート 行・列ハイライト ===
  let _hlRow = -1;
  let _hlColISO = null;
  const d2hEntries = Object.entries(d2h).sort((a, b) => a[1] - b[1]);

  inner.addEventListener('click', e => {
    const rowEl = e.target.closest('[data-row-idx]');
    if (!rowEl) return;
    const clickedIdx = parseInt(rowEl.dataset.rowIdx);
    const allRows = inner.querySelectorAll('[data-row-idx]');

    // --- 行ハイライト ---
    if (_hlRow === clickedIdx) {
      // 同じ行→解除
      _hlRow = -1;
      rowEl.style.background = '';
      const lblOff = rowEl.querySelector('.gantt-lbl');
      lblOff.style.background = 'var(--surface)';
      lblOff.style.borderLeft = '';
      lblOff.style.paddingLeft = '';
    } else {
      // 前の行をリセットして新しい行をハイライト
      allRows.forEach(r => {
        r.style.background = '';
        const rl = r.querySelector('.gantt-lbl');
        rl.style.background = 'var(--surface)';
        rl.style.borderLeft = '';
        rl.style.paddingLeft = '';
      });
      _hlRow = clickedIdx;
      rowEl.style.background = 'rgba(255,210,60,0.06)';
      const lbl = rowEl.querySelector('.gantt-lbl');
      lbl.style.background = 'var(--surface)';
      lbl.style.borderLeft = '3px solid rgba(255,210,60,0.85)';
      lbl.style.paddingLeft = '3px';
    }

    // --- 列ハイライト（チャートエリアをタップした時のみ）---
    const chartArea = e.target.closest('.gantt-chart-area');
    if (chartArea) {
      const rect = chartArea.getBoundingClientRect();
      const contentX = (e.clientX - rect.left) + outer.scrollLeft;
      const contentH = contentX / SC + TODAY_H;
      // タップ時刻を含む稼働日を床取りで確定（2マス目も同じ日にスナップ）
      let nearestISO = d2hEntries[0][0];
      for (const [iso, h] of d2hEntries) {
        if (h <= contentH) nearestISO = iso;
        else break;
      }
      const colHls = inner.querySelectorAll('.gantt-col-hl');
      if (_hlColISO === nearestISO) {
        // 同じ列→解除
        _hlColISO = null;
        colHls.forEach(el => { el.style.display = 'none'; });
      } else {
        _hlColISO = nearestISO;
        const snappedX = h2px(d2h[nearestISO]) - todayOffset;
        colHls.forEach(el => {
          el.style.display = 'block';
          el.style.left = snappedX + 'px';
          el.style.width = fullDayPx + 'px';
          el.style.background = 'rgba(255,210,60,0.13)';
          el.style.borderLeft = '1px solid rgba(255,210,60,0.50)';
          el.style.borderRight = '1px solid rgba(255,210,60,0.50)';
          el.style.zIndex = '3';
        });
      }
    }
  });

}

// === FORCE UPDATE ===
async function forceUpdate() {
  showToast('更新中...');
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch(e) {}
  setTimeout(() => location.reload(true), 800);
}
                                                                                                              