/* Habit Tracker — no dependencies, safe to host on GitHub Pages. */
'use strict';
const EXAMPLE_DATA = { "habits": [  "Wake up at 05:00 ⏰",  "Gym 💪",  "Reading / Learning 📖",  "Day Planning 🗓️",  "Budget Tracking 💰",  "Project Work 🎯",  "No Alcohol 🍃",  "Social Media Detox 🌿",  "Goal Journaling 📓",  "Cold Shower 🚿" ], "checks": [  [   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   0,   1,   1,   1,   0,   0,   0,   1,   0,   0,   1,   0,   1,   1,   1  ],  [   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1,   0,   1,   1,   1,   0,   0,   1,   1,   0,   1,   1,   1,   1,   1,   1  ],  [   1,   1,   1,   0,   1,   1,   0,   1,   1,   1,   1,   0,   1,   1,   1,   0,   0,   1,   1,   0,   0,   1,   1,   0,   1,   1,   1,   1,   1,   1  ],  [   1,   1,   1,   0,   1,   1,   0,   1,   1,   0,   0,   1,   1,   1,   1,   0,   1,   1,   1,   1,   0,   1,   1,   1,   0,   0,   1,   1,   1,   0  ],  [   1,   1,   1,   0,   1,   1,   0,   0,   1,   0,   0,   1,   1,   0,   0,   0,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   1,   1,   1,   1  ],  [   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1  ],  [   1,   1,   1,   1,   0,   0,   1,   0,   0,   1,   0,   0,   0,   0,   0,   1,   1,   0,   0,   0,   1,   0,   0,   0,   0,   0,   0,   1,   0,   0  ],  [   1,   1,   1,   1,   0,   0,   1,   0,   0,   1,   1,   1,   1,   0,   0,   1,   0,   0,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1  ],  [   1,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   0,   0,   1,   0,   0,   0,   0,   0,   0,   0,   0,   1,   1,   1  ],  [   1,   1,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   1  ] ], "mood": [  10,  9,  6,  9,  9,  7,  9,  8,  6,  6,  4,  7,  3,  7,  2,  5,  9,  6,  6,  7,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ], "motivation": [  7,  7,  8,  8,  null,  null,  9,  5,  9,  7,  5,  7,  8,  5,  5,  8,  8,  9,  5,  9,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ]};
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const STORAGE_KEY = 'habit-tracker-reference-web-v1';
const DEFAULT_HABITS = EXAMPLE_DATA.habits.map((label,i) => ({ id:'h'+i, label }));
const $ = id => document.getElementById(id);
const escaped = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const pad = n => String(n).padStart(2,'0');
const daysIn = (y,m) => new Date(y,m+1,0).getDate();
const blankRecord = (days,count=10) => ({checks:Array.from({length:count},()=>Array(days).fill(false)),mood:Array(days).fill(null),motivation:Array(days).fill(null)});
const clone = value => JSON.parse(JSON.stringify(value));
function newState(){return {version:2,habits:clone(DEFAULT_HABITS),records:{},dailyTasks:{},example:{checks:clone(EXAMPLE_DATA.checks).map(row=>row.map(Boolean)),mood:clone(EXAMPLE_DATA.mood),motivation:clone(EXAMPLE_DATA.motivation)}};}
function validRecord(record, days, count=10){
  if(!record || !Array.isArray(record.checks)) return blankRecord(days,count);
  return {checks:Array.from({length:count},(_,i)=>Array.from({length:days},(_,j)=>record.checks[i]?.[j]===true)),mood:Array.from({length:days},(_,j)=>ratingValue(record.mood?.[j])),motivation:Array.from({length:days},(_,j)=>ratingValue(record.motivation?.[j]))};
}
function ratingValue(v){let n=Number(v);return v===null||v===''||v===undefined||!Number.isInteger(n)||n<1||n>10 ? null : n;}
function safeState(raw){
  const s=newState();
  if(!Array.isArray(raw?.habits) || raw.habits.length<1 || raw.habits.length>50) return s;
  const used=new Set();
  s.habits=raw.habits.map((h,i)=>{
    let id=typeof h?.id==='string'&&h.id.length<=100?h.id:'h'+i;
    if(used.has(id))id=`unique-${i}`;
    used.add(id);
    return {id,label:String(h?.label??DEFAULT_HABITS[i%10].label).trim().slice(0,80)||`Habit ${i+1}`};
  });
  if(raw.records && typeof raw.records==='object' && !Array.isArray(raw.records)){
    Object.keys(raw.records).forEach(key=>{
      const match=/^(20\d\d|19\d\d)-(0[1-9]|1[0-2])$/.exec(key);
      if(match){const m=Number(match[2])-1;s.records[key]=validRecord(raw.records[key],daysIn(Number(match[1]),m),s.habits.length);}
    });
  }
  if(raw.dailyTasks && typeof raw.dailyTasks==='object' && !Array.isArray(raw.dailyTasks)){
    Object.entries(raw.dailyTasks).forEach(([date,tasks])=>{
      if(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)||!Array.isArray(tasks))return;
      const [y,m,d]=date.split('-').map(Number);
      if(y<1900||y>2099||d>daysIn(y,m-1))return;
      s.dailyTasks[date]=tasks.slice(0,200).map((task,i)=>({id:String(task?.id??`task-${i}`).slice(0,100),text:String(task?.text??'').trim().slice(0,160),done:task?.done===true})).filter(task=>task.text);
    });
  }
  s.example=validRecord(raw.example,30,10);
  return s;
}
function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));return s?safeState(s):newState();}catch{return newState();}}
let state=load();
let year=new Date().getFullYear();
let view=location.hash.replace('#','').toLowerCase()||'example';
const views=['manual','example','dashboard',...SHORT_MONTHS.map(x=>x.toLowerCase())];
if(!views.includes(view))view='example';
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{toast('Browser storage is unavailable. Export a backup to avoid losing data.');}}
function recordOf(v){
  if(v==='example')return state.example;
  const m=SHORT_MONTHS.map(x=>x.toLowerCase()).indexOf(v);
  if(m===-1)return null;
  const key=`${year}-${pad(m+1)}`;
  if(!state.records[key])state.records[key]=blankRecord(daysIn(year,m),state.habits.length);
  return state.records[key];
}
function monthContext(v){if(v==='example')return {month:10,year:2025,days:30,name:'November',isExample:true};const m=SHORT_MONTHS.map(x=>x.toLowerCase()).indexOf(v);return {month:m,year,days:daysIn(year,m),name:MONTHS[m],isExample:false};}
function stats(record,days){const perHabit=record.checks.map(row=>row.slice(0,days).filter(Boolean).length);const done=perHabit.reduce((a,b)=>a+b,0);const perDay=Array.from({length:days},(_,j)=>record.checks.reduce((sum,row)=>sum+(row[j]===true?1:0),0));const count=record.checks.length;return {done,goal:days*count,percent:days&&count?done/(days*count)*100:0,perHabit,perDay,count};}
function pct(n){return `${n.toFixed(2)}%`;}
function renderTabs(){
 $('tabs').innerHTML=views.map(v=>`<button type="button" class="tab ${v===view?'active':''}" data-view="${v}" ${v===view?'aria-current="page"':''}>${v==='example'?'<span class="tab-dot"></span>':''}${escaped(v==='dashboard'?'Dashboard':v==='manual'?'Manual':v==='example'?'Example':v[0].toUpperCase()+v.slice(1))}</button>`).join('');
}
function renderYear(){const select=$('year-select');select.innerHTML=Array.from({length:19},(_,i)=>{const y=2018+i;return `<option value="${y}" ${year===y?'selected':''}>${y}</option>`;}).join('');}
function bandClass(d){return Math.floor((d-1)/7)%2===0?'alt':'';}
let selectedTaskDay=0;
function taskDate(c){const today=new Date();let day=selectedTaskDay || (c.year===today.getFullYear()&&c.month===today.getMonth()?today.getDate():1);day=Math.max(1,Math.min(c.days,day));return `${c.year}-${pad(c.month+1)}-${pad(day)}`;}
function renderDailyTasks(c){
  const date=taskDate(c),day=Number(date.slice(-2)),tasks=state.dailyTasks[date]||[];
  const completed=tasks.filter(t=>t.done).length;
  return `<section class="daily-tasks" id="daily-tasks" aria-labelledby="task-head"><div class="tasks-head"><div><h2 id="task-head">Daily tasks <span class="tasks-subtitle">· المهام اليومية</span></h2><p>Choose a day, add a one-time task, and check it off when completed.</p></div><div class="tasks-date"><label for="task-day-select">Day</label><select id="task-day-select" aria-label="Choose task day">${Array.from({length:c.days},(_,i)=>`<option value="${i+1}" ${day===i+1?'selected':''}>${c.name} ${i+1}</option>`).join('')}</select></div></div><div class="task-progress"><span>${completed} / ${tasks.length} completed</span><div class="task-progress-track"><i style="width:${tasks.length?completed/tasks.length*100:0}%"></i></div></div><ul class="task-list">${tasks.length?tasks.map(t=>`<li class="task-item ${t.done?'task-done':''}"><button type="button" class="task-tick" data-task-toggle="${escaped(t.id)}" aria-label="${t.done?'Mark unfinished':'Mark completed'}: ${escaped(t.text)}" aria-pressed="${t.done}">${t.done?'✓':''}</button><span class="task-text">${escaped(t.text)}</span><button type="button" class="task-small-btn" data-task-edit="${escaped(t.id)}" aria-label="Edit ${escaped(t.text)}">Edit</button><button type="button" class="task-small-btn danger" data-task-delete="${escaped(t.id)}" aria-label="Delete ${escaped(t.text)}">Delete</button></li>`).join(''):'<li class="task-empty">No tasks for this day yet. Add your first task below.</li>'}</ul><form id="task-add-form" class="task-add"><label class="sr-only" for="new-task">New daily task</label><input id="new-task" name="task" type="text" maxlength="160" required autocomplete="off" placeholder="Write a daily task… / أضف مهمة اليوم"><button class="action primary" type="submit">+ Add task</button></form></section>`;
}
function renderMonth(v){
 const c=monthContext(v),r=recordOf(v),s=stats(r,c.days),habits=c.isExample?EXAMPLE_DATA.habits.map((label,i)=>({id:'h'+i,label})):state.habits;
 const weeks=[];
 for(let start=1;start<=c.days;start+=7){let count=Math.min(7,c.days-start+1);let idx=(start-1)/7;weeks.push(`<th class="${idx%2?'white-week':''}" colspan="${count}" scope="colgroup">${idx<4?'Week '+(idx+1):''}</th>`);}
 const today=new Date();const getCols=()=>`<colgroup><col style="width:157px">${Array.from({length:c.days},()=>'<col style="width:27px">').join('')}</colgroup>`;
 const headerDays=Array.from({length:c.days},(_,i)=>{const d=i+1;return `<th class="day-col ${bandClass(d)}" scope="col" title="${c.name} ${d}">${WEEKDAYS[new Date(c.year,c.month,d).getDay()]}</th>`;}).join('');
 const dateDays=Array.from({length:c.days},(_,i)=>`<th class="day-col ${bandClass(i+1)}" scope="col">${i+1}</th>`).join('');
 const body=habits.map((h,row)=>`<tr><th class="name-col" scope="row" title="${escaped(h.label)}">${escaped(h.label)}</th>${Array.from({length:c.days},(_,i)=>{const day=i+1;const checked=r.checks[row]?.[i]===true;const isToday=!c.isExample&&c.year===today.getFullYear()&&c.month===today.getMonth()&&day===today.getDate();return `<td class="day-col ${bandClass(day)} ${isToday?'today-col':''}"><button class="tick ${checked?'checked':''}" data-row="${row}" data-day="${i}" data-toggle="true" type="button" aria-pressed="${checked}" aria-label="${escaped(h.label)} — ${c.name} ${day}, ${c.year}: ${checked?'completed':'not completed'}" title="${checked?'Completed':'Mark as completed'}"></button></td>`;}).join('')}</tr>`).join('');
 const totals=[['Progress',...s.perDay.map(x=>x/s.count*100+'%')],['Done',...s.perDay],['Not Done',...s.perDay.map(x=>s.count-x)]];
 const totalsMarkup=totals.map(row=>`<tr><th scope="row">${row[0]}</th>${row.slice(1).map((val,i)=>`<td class="${bandClass(i+1)}">${typeof val==='string'?Math.round(parseFloat(val))+'%':val}</td>`).join('')}</tr>`).join('');
 const analysis=`<aside class="analysis" aria-label="Habit analysis"><div class="analysis-title">Analysis</div><table class="analysis-table"><thead><tr><th>Goal</th><th>Actual</th><th>Progress</th></tr></thead><tbody>${s.perHabit.map(n=>`<tr><td>${c.days}</td><td>${n}</td><td class="bar-cell"><div class="analysis-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${(n/c.days*100).toFixed(1)}"><span style="width:${n/c.days*100}%"></span></div></td></tr>`).join('')}</tbody></table></aside>`;
 const ratings=['mood','motivation'].map(k=>`<tr><th scope="row">${k==='mood'?'Mood':'Motivation'}</th>${Array.from({length:c.days},(_,i)=>`<td class="${bandClass(i+1)}"><select class="rating-select" data-rating="${k}" data-day="${i}" aria-label="${k} rating for ${c.name} ${i+1}" title="${k} — day ${i+1}"><option value="">-</option>${Array.from({length:10},(_,n)=>`<option value="${n+1}" ${r[k][i]===n+1?'selected':''}>${n+1}</option>`).join('')}</select></td>`).join('')}</tr>`).join('');
 $('main').innerHTML=`<div class="surface"><section class="month-top" aria-label="Monthly overview"><div class="month-name">${c.name}${c.isExample?'':'<button class="inline-add-habit" type="button" id="inline-add-habit">+ Add habit</button>'}</div><div class="summary-block"><span class="summary-label">Number of habits</span><span class="summary-number">${s.count}</span></div><div class="summary-block"><span class="summary-label">Completed habits</span><span class="summary-number">${s.done}</span></div><div class="summary-block"><span class="summary-label">Progress</span><div class="header-bar" role="progressbar" aria-label="Monthly completion" aria-valuenow="${s.percent.toFixed(2)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${s.percent}%"></span></div></div><div class="summary-block"><span class="summary-label">Progress in %</span><span class="summary-number">${pct(s.percent)}</span></div></section><div class="sheet-stage"><div class="sheet-primary"><div class="sheet-scroll"><table class="habit-table" aria-label="Daily habit check-ins">${getCols()}<thead><tr class="week-row"><th class="name-col habit-main-head" rowspan="3" scope="col">My Habits</th>${weeks.join('')}</tr><tr class="weekday-row">${headerDays}</tr><tr class="date-row">${dateDays}</tr></thead><tbody>${body}</tbody></table></div><div class="totals-wrap"><table class="totals-table" aria-label="Daily totals">${getCols()}<tbody>${totalsMarkup}</tbody></table></div></div>${analysis}</div><div class="chart-outer"><div class="trend-chart">${trendSvg(s.perDay.map(n=>n/s.count*100),'#e0f0de','#96b883',true)}</div></div><div class="rating-region"><table class="ratings-table" aria-label="Mood and motivation ratings">${getCols()}<tbody>${ratings}</tbody></table></div><div class="chart-outer mood-chart"><div class="trend-chart">${trendSvg(r.mood.map(x=>x===null?null:x*10),'#f1e0e8','#cba1b6',false)}</div></div>${c.isExample?'':renderDailyTasks(c)}</div>`;
}
function smoothPath(points){
 if(points.length===0)return '';
 if(points.length===1)return `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
 let path=`M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  const x1=p1[0]+(p2[0]-p0[0])/6,y1=p1[1]+(p2[1]-p0[1])/6;
  const x2=p2[0]-(p3[0]-p1[0])/6,y2=p2[1]-(p3[1]-p1[1])/6;
  path+=` C${x1.toFixed(2)} ${y1.toFixed(2)},${x2.toFixed(2)} ${y2.toFixed(2)},${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
 }
 return path;
}
function trendSvg(series,fill,stroke,isProgress){
 const W=820,H=126,top=7,bottom=121,left=39,right=812;
 const numeric=series.map((v,i)=>[i,v]).filter(([,v])=>v!==null&&Number.isFinite(v));
 const points=numeric.map(([i,v])=>[left+i*(right-left)/Math.max(1,series.length-1),bottom-(Math.min(100,Math.max(0,v))/100)*(bottom-top)]);
 const line=smoothPath(points);let area='';
 if(points.length){area=line+` L${points[points.length-1][0]} ${bottom} L${points[0][0]} ${bottom} Z`;}
 const txt=isProgress?'Track your daily completion':'Select your mood (1–10) above to see the trend';
 return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${isProgress?'Daily completion trend':'Mood trend'}" preserveAspectRatio="none"><rect width="${W}" height="${H}" fill="white"/>${[25,50,75].map(v=>`<text x="6" y="${bottom-(v/100)*(bottom-top)+4}" font-size="10" font-family="Arial, sans-serif" fill="#3a3e39">${v}%</text>`).join('')}${points.length?`<path d="${area}" fill="${fill}"/><path d="${line}" fill="none" stroke="${stroke}" stroke-width="1.6"/>`:`<text x="110" y="62" font-family="Arial" font-size="12" fill="#a2aaa1">${txt}</text>`}</svg>`;
}
function renderDashboard(){
 const months=Array.from({length:12},(_,m)=>{const d=daysIn(year,m),k=`${year}-${pad(m+1)}`;const r=state.records[k]||blankRecord(d,state.habits.length);return {name:MONTHS[m],short:SHORT_MONTHS[m],...stats(r,d)};});
 const done=months.reduce((sum,m)=>sum+m.done,0),goal=months.reduce((sum,m)=>sum+m.goal,0),active=months.filter(m=>m.done>0).length;
 const best=months.reduce((max,m)=>m.percent>max.percent?m:max,months[0]);
 $('main').innerHTML=`<div class="dashboard-top"><div><h1>Annual Dashboard</h1><p>Your habit progress throughout ${year}</p></div><div class="summary-number">${year}</div></div><div class="dashboard-cards"><div class="dash-card"><div class="dash-label">Completed habits</div><strong>${done.toLocaleString('en-US')}</strong><span>of ${goal.toLocaleString('en-US')} possible</span></div><div class="dash-card"><div class="dash-label">Annual progress</div><strong>${pct(goal?done/goal*100:0)}</strong><span>Across all 12 months</span></div><div class="dash-card"><div class="dash-label">Active months</div><strong>${active} / 12</strong><span>Months with at least one check-in</span></div><div class="dash-card"><div class="dash-label">Best month</div><strong>${best.done?best.short:'—'}</strong><span>${best.done?pct(best.percent):'Start tracking to see this'}</span></div></div><div class="dashboard-lower"><section class="dash-panel"><h2>Monthly progress</h2><div class="dashboard-months">${months.map(m=>`<div class="month-graph" role="button" tabindex="0" data-openmonth="${m.short.toLowerCase()}" title="${m.name}: ${pct(m.percent)}"><div class="month-graph-meter"><div class="month-graph-fill" style="height:${m.percent}%"></div></div><div class="month-graph-label">${m.short}</div></div>`).join('')}</div><p class="helper">Select a month to open its habit tracker.</p></section><section class="dash-panel"><h2>Monthly summary</h2><table class="dash-month-table"><thead><tr><th>Month</th><th>Done</th><th>Progress</th></tr></thead><tbody>${months.map(m=>`<tr data-openmonth="${m.short.toLowerCase()}" title="Open ${m.name}"><td>${m.name}</td><td>${m.done} / ${m.goal}</td><td><div class="mini-progress" title="${pct(m.percent)}"><i style="width:${m.percent}%"></i></div><span>${pct(m.percent)}</span></td></tr>`).join('')}</tbody></table></section></div>`;
}
function renderManual(){
 $('main').innerHTML=`<article class="manual-page"><h1>Habit Tracker — User Manual</h1><p class="intro" dir="rtl">مرحبا بيك فـHabit Tracker! هاد الموقع مستوحى من الجدول الأصلي اللي فالصورة، وكيخدم مباشرة من المتصفح بلا تسجيل حساب.</p><h2>1. Daily check-ins</h2><p>Open any month (Jan–Dec). Click a square when you finish a habit. Click it again to uncheck. Your monthly totals, each habit's progress bars, and the green chart update immediately.</p><h2>2. Mood and motivation</h2><p>Below the chart, rate your Mood and Motivation from 1 to 10. The pink chart visualizes your mood over the month.</p><h2>3. Customize and review</h2><p>Use <strong>Manage habits</strong> to add, rename, or remove habits. View your <strong>Dashboard</strong> for yearly statistics. Open <strong>Example</strong> for the original November demo (162 check-ins, 54%).</p><h2>4. Daily tasks / المهام اليومية</h2><p>Select a month, go to the Daily tasks section, choose a day, and add tasks. Each task can be marked complete, edited or deleted. Daily tasks are separate from recurring habits and do not change the habit completion percentage.</p><h2>5. Keep your progress safe</h2><p>All information is kept in the browser's local storage. Use <strong>Export → Download backup</strong> to save a JSON file and <strong>Import</strong> to restore it, especially before switching devices or clearing browser data.</p><h2>6. Useful notes</h2><ul><li>Every month automatically adjusts for its correct number of days and weekdays.</li><li>The example is separate from your personal 12-month tracker.</li><li>GitHub Pages hosts the site, not your private progress — there is no cross-device synchronization.</li><li>Export CSV to open the selected month in Excel or Google Sheets.</li></ul></article>`;
}
function render(keepScroll=false){
 const old=keepScroll?{sheet:document.querySelector('.sheet-scroll')?.scrollLeft||0,totals:document.querySelector('.totals-wrap')?.scrollLeft||0,ratings:document.querySelector('.rating-region')?.scrollLeft||0}:null;
 renderTabs();renderYear();
 if(view==='dashboard')renderDashboard();else if(view==='manual')renderManual();else renderMonth(view);
 if(old){const el=document.querySelector('.sheet-scroll');if(el)el.scrollLeft=old.sheet;const t=document.querySelector('.totals-wrap');if(t)t.scrollLeft=old.totals;const r=document.querySelector('.rating-region');if(r)r.scrollLeft=old.ratings;}
}
let toastTimer;
function toast(msg){const node=$('toast');node.textContent=msg;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3500);}
function route(v){if(!views.includes(v))return;selectedTaskDay=0;view=v;render();if(location.hash!=='#'+v)location.hash=v;}
$('tabs').addEventListener('click',e=>{const el=e.target.closest('[data-view]');if(el)route(el.dataset.view);});
window.addEventListener('hashchange',()=>{const newView=location.hash.slice(1);const target=views.includes(newView)?newView:'example';if(target!==view){view=target;selectedTaskDay=0;render();}});
$('year-select').addEventListener('change',e=>{year=Number(e.target.value);selectedTaskDay=0;render();});
$('main').addEventListener('click',e=>{
 const tick=e.target.closest('[data-toggle]');
 if(tick){const r=recordOf(view),row=Number(tick.dataset.row),day=Number(tick.dataset.day);if(!r?.checks[row]||day<0||day>=r.checks[row].length)return;r.checks[row][day]=!r.checks[row][day];save();render(true);return;}
 const plus=e.target.closest('#inline-add-habit');if(plus){openHabitsDialog(true);return;}
 const taskToggle=e.target.closest('[data-task-toggle]');
 const taskEdit=e.target.closest('[data-task-edit]');
 const taskDelete=e.target.closest('[data-task-delete]');
 if(taskToggle||taskEdit||taskDelete){
  const date=taskDate(monthContext(view)),tasks=state.dailyTasks[date]||[];
  const id=(taskToggle||taskEdit||taskDelete).dataset[taskToggle?'taskToggle':taskEdit?'taskEdit':'taskDelete'];
  const task=tasks.find(t=>t.id===id);if(!task)return;
  if(taskToggle){task.done=!task.done;save();render(true);return;}
  if(taskEdit){$('task-edit-date').value=date;$('task-edit-id').value=id;$('task-edit-input').value=task.text;$('task-dialog').showModal();$('task-edit-input').focus();return;}
  if(taskDelete&&confirm(`Delete this daily task?\n\n${task.text}`)){state.dailyTasks[date]=tasks.filter(t=>t.id!==id);save();render(true);toast('Task deleted.');return;}
 }
 const month=e.target.closest('[data-openmonth]');if(month)route(month.dataset.openmonth);
});
$('main').addEventListener('keydown',e=>{const m=e.target.closest('.month-graph[data-openmonth]');if(m && (e.key==='Enter'||e.key===' ')){e.preventDefault();route(m.dataset.openmonth);}});
$('main').addEventListener('change',e=>{
 const daySelect=e.target.closest('#task-day-select');
 if(daySelect){selectedTaskDay=Number(daySelect.value);render(true);return;}
 const input=e.target.closest('select[data-rating]');if(!input)return;const r=recordOf(view);if(!r)return;r[input.dataset.rating][Number(input.dataset.day)]=ratingValue(input.value);save();render(true);
});
$('main').addEventListener('submit',e=>{
 if(e.target.id!=='task-add-form')return;
 e.preventDefault();const input=$('new-task'),title=input.value.trim();if(!title)return;
 const date=taskDate(monthContext(view)),tasks=state.dailyTasks[date]||(state.dailyTasks[date]=[]);
 if(tasks.length>=200){toast('Maximum 200 tasks per day.');return;}
 tasks.push({id:newId('task'),text:title.slice(0,160),done:false});save();render(true);$('new-task')?.focus();toast('Task added.');
});
function newId(prefix){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;}
function habitRow(h){return `<div class="manage-habit-row" data-habitid="${escaped(h.id)}"><span class="manage-drag">⋮</span><input type="text" aria-label="Habit name" maxlength="80" required value="${escaped(h.label)}"><button class="action-danger" type="button" data-remove-habit aria-label="Remove habit">×</button></div>`;}
function openHabitsDialog(focusNew=false){
 $('habit-fields').innerHTML=state.habits.map(habitRow).join('');
 $('habit-dialog').showModal();
 if(focusNew)addDraftHabit();
}
function addDraftHabit(){
 const el=$('habit-fields');if(el.children.length>=50){toast('Maximum 50 habits.');return;}
 el.insertAdjacentHTML('beforeend',habitRow({id:newId('habit'),label:''}));
 el.lastElementChild.querySelector('input').focus();
}
$('habits-button').addEventListener('click',()=>openHabitsDialog());
$('add-habit-button').addEventListener('click',addDraftHabit);
$('habit-fields').addEventListener('click',e=>{if(!e.target.closest('[data-remove-habit]'))return;if($('habit-fields').children.length<=1){toast('Keep at least one habit.');return;}e.target.closest('.manage-habit-row').remove();});
$('habits-form').addEventListener('submit',e=>{
 e.preventDefault();
 const rows=[...$('habit-fields').querySelectorAll('.manage-habit-row')];
 const next=rows.map(row=>({id:row.dataset.habitid,label:row.querySelector('input').value.trim().slice(0,80)}));
 if(next.length<1||next.some(h=>!h.label)){toast('Every habit needs a name.');return;}
 const prev=state.habits;const deleted=prev.filter(h=>!next.some(n=>n.id===h.id));
 if(deleted.length&&!confirm(`Delete ${deleted.length} habit(s)? Their saved check-ins will also be deleted from every month.`))return;
 const indexById=new Map(prev.map((h,i)=>[h.id,i]));
 for(const [key,record] of Object.entries(state.records)){
   const days=record.mood.length;
   record.checks=next.map(h=>{const index=indexById.get(h.id);return index===undefined?Array(days).fill(false):Array.from(record.checks[index]||Array(days).fill(false));});
 }
 state.habits=next;save();$('habit-dialog').close();render(true);toast('Habits saved.');
});
$('task-edit-form').addEventListener('submit',e=>{
 e.preventDefault();
 const date=$('task-edit-date').value,id=$('task-edit-id').value,task=(state.dailyTasks[date]||[]).find(t=>t.id===id);
 const text=$('task-edit-input').value.trim();
 if(!task||!text)return;
 task.text=text;save();$('task-dialog').close();render(true);toast('Task updated.');
});
for(const b of document.querySelectorAll('[data-close]'))b.addEventListener('click',()=>$(b.dataset.close).close());
$('export-button').addEventListener('click',()=>$('export-dialog').showModal());
$('import-button').addEventListener('click',()=>$('import-file').click());
function download(filename,text,mimetype){const blob=new Blob([text],{type:mimetype});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download-json').addEventListener('click',()=>{download(`habit-tracker-backup-${year}.json`,JSON.stringify(state,null,2),'application/json');$('export-dialog').close();toast('Backup downloaded.');});
$('download-csv').addEventListener('click',()=>{
 const isMonth=view==='example'||SHORT_MONTHS.map(x=>x.toLowerCase()).includes(view),target=isMonth?view:SHORT_MONTHS[new Date().getMonth()].toLowerCase();
 const c=monthContext(target),r=recordOf(target);const data=[['Habit',...Array.from({length:c.days},(_,i)=>`${c.name} ${i+1}`),'Total'],...(c.isExample?EXAMPLE_DATA.habits.map((label,i)=>({label})):state.habits).map((h,i)=>[h.label,...r.checks[i].slice(0,c.days).map(x=>x?'1':'0'),r.checks[i].filter(Boolean).length]),['Mood',...r.mood.map(x=>x??''),''],['Motivation',...r.motivation.map(x=>x??''),'']];
 if(!c.isExample){data.push([],['Date','Daily task','Completed']);for(let d=1;d<=c.days;d++){const k=`${c.year}-${pad(c.month+1)}-${pad(d)}`;for(const task of state.dailyTasks[k]||[])data.push([k,task.text,task.done?'Yes':'No']);}}
 const csv='\ufeff'+data.map(row=>row.map(x=>{const value=String(x);return '"'+(/^[=+@\-\t\r]/.test(value)?'\u0027':'')+value.replaceAll('"','""')+'"';}).join(',')).join('\r\n');download(`habit-tracker-${target}-${c.year}.csv`,csv,'text/csv;charset=utf-8');$('export-dialog').close();toast('CSV downloaded.');
});
$('import-file').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{const text=await file.text(),obj=JSON.parse(text);if(!Array.isArray(obj.habits)||obj.habits.length<1||obj.habits.length>50||!obj.records || typeof obj.records!=='object' || !obj.example)throw Error('invalid');
 if(!confirm('Restore this backup? It will replace the current saved tracker data.'))return;
 state=safeState(obj);save();render();toast('Backup restored successfully.');
 }catch{toast('Invalid backup file. Select a Habit Tracker JSON backup.');}finally{e.target.value='';}
});
render();