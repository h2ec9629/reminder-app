'use strict';
// BUILD: 2026-05-24-A

// === DATA ===
const KEY = 'ojisan_reminders_v1';
const getAll  = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch{return[];} };
const saveAll = a => localStorage.setItem(KEY, JSON.stringify(a));
const genId   = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const todayStr= () => new Date().toISOString().split('T')[0];

function addReminder(r) {
  const a = getAll();
  r.id = genId(); r.created_at = todayStr(); r.completed = false;
  a.push(r); saveAll(a); return r;
}
const markDone        = id => {
  const r = getAll().find(r => r.id===id);
  if (r) addGrave(r.title+'|'+(r.deadline||'null')); // 完了=削除済み扱いで同期時に復活させない
  saveAll(getAll().map(r => r.id===id ? {...r, completed:true, completed_at:todayStr()} : r));
};
const updateReminder  = (id, changes) => saveAll(getAll().map(r => r.id===id ? {...r, ...changes} : r));

// === 削除済みグレーブヤード（同期で復活させない） ===
const GRAVE_KEY   = 'ojisan_deleted_v1';
const getGrave    = () => { try { return new Set(JSON.parse(localStorage.getItem(GRAVE_KEY)||'[]')); } catch{return new Set();} };
const addGrave    = key => { const g=getGrave(); g.add(key); localStorage.setItem(GRAVE_KEY, JSON.stringify([...g])); };
const deleteOne   = id => {
  const r = getAll().find(r => r.id===id);
  if (r) addGrave(r.title+'|'+(r.deadline||'null'));
  saveAll(getAll().filter(r => r.id!==id));
};

// === DATE ===
function daysUntil(s) {
  const t=new Date(); t.setHours(0,0,0,0);
  const d=new Date(s); d.setHours(0,0,0,0);
  return Math.round((d-t)/86400000);
}
function fmtDate(s) {
  const d=new Date(s);
  return `${d.getMonth()+1}/${d.getDate()}(${'日月火水木金土'[d.getDay()]})`;
}
function daysLabel(n) {
  if(n<0)   return `${Math.abs(n)}日超過`;
  if(n===0) return '今日が期限';
  if(n===1) return '明日が期限';
  return `${n}日後`;
}
function urgClass(n, adv) {
  if(n<0)  return 'overdue';
  if(n===0 || n<=Math.min(adv,2)) return 'urgent';
  if(n<=7) return 'soon';
  return '';
}
function chipCls(n) {
  if(n<0)  return 'dc-purple';
  if(n<=2) return 'dc-danger';
  if(n<=7) return 'dc-warning';
  return '';
}


