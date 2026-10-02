(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const startScreen=$('#startScreen'),lessonScreen=$('#lessonScreen'),roleSelect=$('#roleSelect'),parentSetup=$('#parentSetup'),childSetup=$('#childSetup');
const stage=$('#stage'),stageInner=$('#stageInner'),canvas=$('#canvas'),ctx=canvas.getContext('2d'),pointerLayer=$('#pointerLayer');
const feedback=$('#feedback'),roundDone=$('#roundDone'),continueRound=$('#continueRound');
const progressTitle=$('#progressTitle'),progressRound=$('#progressRound'),blocksEl=$('#blocks'),taskIcon=$('#taskIcon'),step=$('#step'),taskTitle=$('#taskTitle'),taskSubtitle=$('#taskSubtitle');
const controls=$('#controls'),childTools=$('#childTools'),liveStatus=$('#liveStatus'),netNote=$('#netNote');
let role='demo', room='', peer=null, conn=null, reconnectTimer=null, heartbeatTimer=null, connected=false;
let drawActive=false,currentStroke=null,remoteStroke=null,lastPointSent=0,feedbackTimer=null,dragCleanup=[];
let state={block:0,round:0,done:false,finished:false,updatedAt:Date.now(),roundData:{}};

const blocks=[
 {name:'Разминка',icon:'👀',rounds:[
  {type:'choice',title:'Кто живёт в воде?',subtitle:'Найди того, кто умеет жить в воде.',correct:'fish',items:[['cat','🐱','Кот'],['fish','🐟','Рыбка'],['dog','🐶','Собака'],['rabbit','🐰','Зайчик']]},
  {type:'choice',title:'Кто умеет летать?',subtitle:'Нажми на того, кто летает.',correct:'butterfly',items:[['hedgehog','🦔','Ёжик'],['butterfly','🦋','Бабочка'],['frog','🐸','Лягушка'],['snail','🐌','Улитка']]},
  {type:'choice',title:'Что можно съесть?',subtitle:'Выбери еду.',correct:'apple',items:[['ball','⚽','Мяч'],['shoe','👟','Ботинок'],['apple','🍎','Яблоко'],['car','🚗','Машинка']]},
  {type:'choice',title:'Сколько яблок?',subtitle:'Посчитай яблоки и выбери цифру.',visual:['🍎','🍎','🍎'],visualType:'count',correct:'3',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]}
 ]},
 {name:'Собираем вещи',icon:'🧺',rounds:[
  {type:'sort',title:'Фрукты — в корзину',subtitle:'Перетащи все фрукты. Лишние предметы оставь на месте.',target:'🧺',label:'Корзина',accept:['apple','banana','pear'],items:[['apple','🍎'],['car','🚗'],['banana','🍌'],['ball','⚽'],['pear','🍐'],['duck','🦆']]},
  {type:'sort',title:'Игрушки — в коробку',subtitle:'Перетащи в коробку только игрушки.',target:'📦',label:'Коробка',accept:['teddy','ball','car'],items:[['teddy','🧸'],['banana','🍌'],['ball','⚽'],['brush','🪥'],['car','🚗'],['leaf','🍂']]},
  {type:'collect',title:'Найди все грибочки',subtitle:'Нажми на все 3 грибочка. Остальные картинки не трогай.',targets:['m1','m2','m3'],counterEmoji:'🍄',wrongText:'Это не гриб',items:[['m1','🍄',14,28],['leaf','🍂',37,22],['m2','🍄',61,30],['fox','🦊',85,22],['acorn','🌰',25,72],['m3','🍄',49,68],['frog','🐸',72,70],['flower','🌼',90,66]]}
 ]},
 {name:'Дорога и пары',icon:'🛣️',rounds:[
  {type:'trace',title:'Довези машинку домой',subtitle:'Начни от машинки и веди пальчиком по большой дорожке к дому.',start:'🚗',end:'🏠',path:'M95 360 C190 330 145 235 280 235 S430 315 495 200 S650 120 760 110'},
  {type:'trace',title:'Помоги пчёлке',subtitle:'Проведи пчёлку по дорожке к цветку.',start:'🐝',end:'🌼',path:'M95 360 C170 270 235 345 320 260 S455 150 520 220 S650 280 760 110'},
  {type:'match',title:'Кому что нравится?',subtitle:'Нажми на животное, потом на то, что ему подходит. Собери 3 пары.',pairs:[['rabbit','🐰','carrot','🥕'],['dog','🐶','bone','🦴'],['cat','🐱','fish','🐟']]}
 ]},
 {name:'Логика и счёт',icon:'🧠',rounds:[
  {type:'choice',title:'Найди лишнее',subtitle:'Три картинки — фрукты. Одна лишняя.',correct:'car',items:[['apple','🍎',''],['pear','🍐',''],['car','🚗',''],['banana','🍌','']]},
  {type:'choice',title:'Найди лишнее',subtitle:'Три картинки — животные. Одна лишняя.',correct:'ball',items:[['dog','🐶',''],['cat','🐱',''],['ball','⚽',''],['rabbit','🐰','']]},
  {type:'choice',title:'Что будет дальше?',subtitle:'Посмотри на ряд и выбери следующую картинку.',visual:['🍎','🍌','🍎','🍌','❓'],visualType:'sequence',correct:'apple',items:[['pear','🍐',''],['apple','🍎',''],['banana','🍌',''],['orange','🍊','']]},
  {type:'choice',title:'Сколько звёздочек?',subtitle:'Посчитай звёздочки и выбери цифру.',visual:['⭐','⭐','⭐','⭐'],visualType:'count',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]}
 ]},
 {name:'Финальная миссия',icon:'🏆',rounds:[
  {type:'collect',title:'Собери морковки для зайчика',subtitle:'Найди и нажми на все 4 морковки.',targets:['c1','c2','c3','c4'],counterEmoji:'🥕',wrongText:'Это не морковка',items:[['c1','🥕',13,24],['ball','⚽',34,19],['c2','🥕',57,28],['duck','🦆',82,20],['c3','🥕',23,70],['car','🚗',45,72],['c4','🥕',69,66],['apple','🍎',89,72]]},
  {type:'choice',title:'Сколько морковок мы собрали?',subtitle:'Посчитай морковки и выбери цифру.',visual:['🥕','🥕','🥕','🥕'],visualType:'count',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]},
  {type:'match',title:'Последние пары',subtitle:'Соедини героев с их местом или предметом.',pairs:[['fish','🐟','water','🌊'],['bee','🐝','flower','🌼'],['car','🚗','home','🏠']]},
  {type:'trace',title:'Проводим зайчика домой',subtitle:'Последняя большая дорожка — и урок закончен!',start:'🐰',end:'🏡',path:'M95 360 C175 315 190 220 305 250 S430 340 505 235 S660 135 760 110'}
 ]}
];

function key(){return `${state.block}-${state.round}`}
function data(){if(!state.roundData[key()]) state.roundData[key()]={}; return state.roundData[key()]}
function touchState(){state.updatedAt=Date.now();updateNextControls();sendState()}
function setStatus(el,kind,text){el.className='status '+kind;el.innerHTML='<span class="dot"></span><span>'+text+'</span>'}
function showSetup(which){roleSelect.style.display='none';parentSetup.classList.toggle('active',which==='parent');childSetup.classList.toggle('active',which==='child')}
function resetHome(){try{conn?.close()}catch{};try{peer?.destroy()}catch{};clearTimeout(reconnectTimer);clearInterval(heartbeatTimer);peer=conn=null;connected=false;roleSelect.style.display='block';parentSetup.classList.remove('active');childSetup.classList.remove('active');startScreen.style.display='block';lessonScreen.classList.remove('active');document.body.classList.remove('lesson-open','needs-landscape','child-role');}
$$('.backBtn').forEach(b=>b.onclick=resetHome);$('#exitLesson').onclick=resetHome;$('#finishExit').onclick=resetHome;

function freshState(){state={block:0,round:0,done:false,finished:false,updatedAt:Date.now(),roundData:{}}}
$('#demoRole').onclick=()=>{role='demo';freshState();enterLesson();};
$('#parentRole').onclick=startParent;

function makeRoom(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function childUrl(){const base=location.href.split('?')[0].split('#')[0];return `${base}?child=1&room=${encodeURIComponent(room)}`}
function startParent(){role='parent';freshState();room=makeRoom();showSetup('parent');$('#shareLink').textContent=childUrl();$('#shareLink').dataset.url=childUrl();if(typeof Peer==='undefined'){setStatus($('#parentStatus'),'error','PeerJS не загрузился. Для локального теста используй тестовый режим.');return}const id='kidsv2-'+room.toLowerCase();peer=new Peer(id,{debug:0});peer.on('open',()=>setStatus($('#parentStatus'),'waiting','Ждём открытия ссылки у ребёнка'));peer.on('connection',c=>{if(conn&&conn.open)try{conn.close()}catch{};conn=c;setupConn(c)});peer.on('disconnected',()=>{setStatus($('#parentStatus'),'waiting','Сигнализация потеряна — восстанавливаем…');try{peer.reconnect()}catch{}});peer.on('error',e=>setStatus($('#parentStatus'),'error','Ошибка: '+e.type));}
$('#copyLinkBtn').onclick=async()=>{const u=$('#shareLink').dataset.url||$('#shareLink').textContent;try{await navigator.clipboard.writeText(u);$('#copyLinkBtn').textContent='Скопировано ✓'}catch{const t=document.createElement('textarea');t.value=u;document.body.append(t);t.select();document.execCommand('copy');t.remove();$('#copyLinkBtn').textContent='Скопировано ✓'}};
$('#parentEnterLesson').onclick=enterLesson;

function startChild(code){role='child';freshState();state.updatedAt=0;room=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);document.body.classList.add('child-role');showSetup('child');if(typeof Peer==='undefined'){setStatus($('#childStatus'),'error','Не удалось загрузить модуль связи');return}connectChildPeer();}
function connectChildPeer(){clearTimeout(reconnectTimer);if(peer&&!peer.destroyed){try{peer.destroy()}catch{}};peer=new Peer(undefined,{debug:0});peer.on('open',()=>connectToParent());peer.on('disconnected',()=>{setStatus($('#childStatus'),'waiting','Восстанавливаем соединение…');try{peer.reconnect()}catch{scheduleReconnect()}});peer.on('error',e=>{if(e.type==='peer-unavailable'){setStatus($('#childStatus'),'waiting','Взрослый ещё не подключён. Повторяем…');scheduleReconnect()}else{setStatus($('#childStatus'),'waiting','Связь нестабильна. Повторяем…');scheduleReconnect()}});}
function connectToParent(){if(!peer||peer.destroyed)return;try{conn=peer.connect('kidsv2-'+room.toLowerCase(),{reliable:true,serialization:'json'});setupConn(conn)}catch{scheduleReconnect()}}
function scheduleReconnect(){clearTimeout(reconnectTimer);reconnectTimer=setTimeout(()=>{if(role==='child'&&!connected){if(peer&&peer.open)connectToParent();else connectChildPeer()}},2500)}

function setupConn(c){c.on('open',()=>{connected=true;if(role==='parent'){setStatus($('#parentStatus'),'online','Ребёнок подключён ✓');$('#parentEnterLesson').disabled=false}else{setStatus($('#childStatus'),'online','Подключено ✓');if(!lessonScreen.classList.contains('active'))enterLesson()}setLive(true);send({type:'snapshot',state});send({type:'hello'});clearInterval(heartbeatTimer);heartbeatTimer=setInterval(()=>send({type:'ping'}),6000)});c.on('data',handleMsg);c.on('close',()=>{connected=false;setLive(false);if(role==='child')scheduleReconnect();else setStatus($('#parentStatus'),'waiting','Связь потеряна. Ждём переподключения…')});c.on('error',()=>{connected=false;setLive(false);if(role==='child')scheduleReconnect()})}
function send(obj){if(conn&&conn.open)try{conn.send(obj)}catch{}}
function sendState(){send({type:'snapshot',state})}
function handleMsg(m){if(!m||typeof m!=='object')return;if(m.type==='hello'){sendState();return}if(m.type==='snapshot'&&m.state){if((m.state.updatedAt||0)>(state.updatedAt||0)){state=JSON.parse(JSON.stringify(m.state));render()}return}if(m.type==='praise'){showFeedback('👍 Молодец!','good');return}if(m.type==='stroke'){receiveStroke(m);return}if(m.type==='pointer'){showPointer(m.x,m.y);return}}
function setLive(ok){if(role==='demo'){setStatus(liveStatus,'online','Тестовый режим');netNote.textContent='';return}if(ok){setStatus(liveStatus,'online','На связи');netNote.textContent=''}else{setStatus(liveStatus,'waiting','Переподключаемся…');netNote.textContent=role==='child'?'Можно продолжать урок — прогресс не пропадёт.':'Экран останется на месте.'}}
window.addEventListener('online',()=>{if(role!=='demo'&&!connected){setLive(false);if(role==='child')scheduleReconnect()}});window.addEventListener('offline',()=>{if(role!=='demo'){connected=false;setLive(false)}});

function enterLesson(){startScreen.style.display='none';lessonScreen.classList.add('active');document.body.classList.add('lesson-open');if(role==='child'||role==='demo')document.body.classList.add('needs-landscape');controls.style.display=role==='child'?'none':'flex';childTools.style.display=(role==='child')?'block':'none';setLive(connected||role==='demo');render()}
function currentRound(){return blocks[state.block]?.rounds[state.round]}
function render(){cleanupDrag();if(state.finished){showFinish();return}$('#taskCard').classList.remove('hidden');$('#finishCard').classList.remove('active');const b=blocks[state.block],r=currentRound();if(!b||!r){finishLesson();return}progressTitle.textContent=`Блок ${state.block+1} из ${blocks.length} • ${b.name}`;progressRound.textContent=`Раунд ${state.round+1} из ${b.rounds.length}`;step.textContent=`${b.name} · ${state.round+1}/${b.rounds.length}`;taskIcon.textContent=b.icon;taskTitle.textContent=r.title;taskSubtitle.textContent=r.subtitle;blocksEl.innerHTML=blocks.map((_,i)=>`<div class="block-dot ${i<state.block?'done':i===state.block?'active':''}"></div>`).join('');stageInner.innerHTML='';pointerLayer.innerHTML='';canvas.style.pointerEvents='none';canvas.style.display='none';roundDone.classList.remove('show');continueRound.textContent=(state.block===blocks.length-1&&state.round===b.rounds.length-1)?'Завершить урок 🎉':(state.round===b.rounds.length-1?'Следующий блок →':'Продолжить →');$('#clearBtn').style.display=r.type==='trace'?'inline-block':'none';$('#childClear').style.display=r.type==='trace'?'inline-block':'none';$('#prevBtn').disabled=state.block===0&&state.round===0;renderRound(r);updateNextControls();}
function renderRound(r){if(r.type==='choice')renderChoice(r);else if(r.type==='sort')renderSort(r);else if(r.type==='trace')renderTrace(r);else if(r.type==='collect')renderCollect(r);else if(r.type==='match')renderMatch(r)}
function showFeedback(text,kind='good'){clearTimeout(feedbackTimer);feedback.textContent=text;feedback.className='feedback show '+kind;feedbackTimer=setTimeout(()=>feedback.className='feedback',1400)}
function showPointer(x,y){const p=document.createElement('div');p.className='remote-pointer';p.style.left=(x*100)+'%';p.style.top=(y*100)+'%';pointerLayer.appendChild(p);setTimeout(()=>p.remove(),600)}
function sendPointerFrom(el){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();send({type:'pointer',x:(r.left+r.width/2-s.left)/s.width,y:(r.top+r.height/2-s.top)/s.height})}

function renderChoice(r){
 const d=data();
 if(r.visual){
   const isSequence=r.visualType==='sequence';
   const visualHTML=isSequence
     ? `<div class="sequence-objects">${r.visual.map(e=>`<div class="sequence-object">${e}</div>`).join('')}</div>`
     : `<div class="count-objects ${r.visual.length===3?'three':''}">${r.visual.map(e=>`<div class="count-object">${e}</div>`).join('')}</div>`;

   const answersHTML=`${r.items.map(([id,e,l])=>`<button class="choice visual-answer ${d.selected===id?'selected':''}" data-id="${id}"><div class="emo">${e}</div>${l?`<div class="lab">${l}</div>`:''}</button>`).join('')}`;

   if(isSequence){
     stageInner.innerHTML=`<div class="visual-board">
       <div class="sequence-zone"><div class="zone-label">Ряд</div>${visualHTML}</div>
       <div class="answer-zone"><div class="zone-label">Выбери</div><div class="visual-answers">${answersHTML}</div></div>
     </div>`;
   }else{
     stageInner.innerHTML=`<div class="visual-board"><div class="visual-main">${visualHTML}</div><div class="visual-answers">${answersHTML}</div></div>`;
   }
 }else{
   stageInner.innerHTML=`<div class="choices">${r.items.map(([id,e,l])=>`<button class="choice ${d.selected===id?'selected':''}" data-id="${id}"><div class="emo">${e}</div>${l?`<div class="lab">${l}</div>`:''}</button>`).join('')}</div>`;
 }
 $$('.choice').forEach(btn=>{
   btn.disabled=role==='parent';
   if(role!=='parent')btn.onclick=()=>{
     sendPointerFrom(btn);
     const id=btn.dataset.id;
     if(id===r.correct){
       d.selected=id;
       $$('.choice').forEach(x=>x.classList.toggle('selected',x===btn));
       state.done=true;
       showFeedback('👍 Молодец!','good');
       touchState();
     }else{
       d.selected=null;
       $$('.choice').forEach(x=>x.classList.remove('selected'));
       btn.classList.add('wrong');
       state.done=false;
       showFeedback('👎 Попробуй ещё','try');
       touchState();
       setTimeout(()=>btn.classList.remove('wrong'),450);
     }
   };
 });
}
function renderSoon(){}

function renderSort(r){const d=data();d.placed=d.placed||[];stageInner.innerHTML=`<div class="sort-board"><div class="sort-items">${r.items.map(([id,e])=>`<div class="drag-item ${d.placed.includes(id)?'placed':''}" data-id="${id}">${e}</div>`).join('')}</div><div id="dropZone" class="drop-zone"><div>${r.target}</div><div class="drop-label">${r.label}</div></div></div>`;if(role!=='parent')initDrag(r)}
function cleanupDrag(){dragCleanup.forEach(fn=>{try{fn()}catch{}});dragCleanup=[]}
function initDrag(r){const zone=$('#dropZone');$$('.drag-item').forEach(item=>{if(item.classList.contains('placed'))return;let dragging=false,startX=0,startY=0,origin=null;const down=e=>{e.preventDefault();dragging=true;item.setPointerCapture?.(e.pointerId);const rc=item.getBoundingClientRect();origin={parent:item.parentNode,next:item.nextSibling,style:item.getAttribute('style')||''};startX=e.clientX-rc.left;startY=e.clientY-rc.top;item.style.position='fixed';item.style.left=(e.clientX-startX)+'px';item.style.top=(e.clientY-startY)+'px';item.style.width=rc.width+'px';item.style.height=rc.height+'px';item.style.zIndex=99;document.body.appendChild(item)};const move=e=>{if(!dragging)return;e.preventDefault();item.style.left=(e.clientX-startX)+'px';item.style.top=(e.clientY-startY)+'px';const z=zone.getBoundingClientRect();zone.classList.toggle('active',e.clientX>=z.left&&e.clientX<=z.right&&e.clientY>=z.top&&e.clientY<=z.bottom)};const up=e=>{if(!dragging)return;dragging=false;const z=zone.getBoundingClientRect(),inside=e.clientX>=z.left&&e.clientX<=z.right&&e.clientY>=z.top&&e.clientY<=z.bottom;const id=item.dataset.id;zone.classList.remove('active');if(origin.next&&origin.next.parentNode===origin.parent)origin.parent.insertBefore(item,origin.next);else origin.parent.appendChild(item);item.setAttribute('style',origin.style);if(inside){if(r.accept.includes(id)){const d=data();if(!d.placed.includes(id))d.placed.push(id);showFeedback('👍 Молодец!','good');if(r.accept.every(x=>d.placed.includes(x)))state.done=true;touchState();render()}else{showFeedback('👎 Не сюда','try')}}};item.addEventListener('pointerdown',down);item.addEventListener('pointermove',move);item.addEventListener('pointerup',up);item.addEventListener('pointercancel',up);dragCleanup.push(()=>{item.removeEventListener('pointerdown',down);item.removeEventListener('pointermove',move);item.removeEventListener('pointerup',up);item.removeEventListener('pointercancel',up)})})}

function renderTrace(r){const d=data();d.strokes=d.strokes||[];stageInner.innerHTML=`<div class="trace-board"><svg class="road-svg" viewBox="0 0 850 430" preserveAspectRatio="none"><path class="road-wide" d="${r.path}"/><path class="road-dash" d="${r.path}"/></svg><div class="trace-start">${r.start}</div><div class="trace-end">${r.end}</div></div>`;canvas.style.display='block';canvas.style.pointerEvents=role==='parent'?'none':'auto';resizeCanvas();drawAll(d.strokes);}
function resizeCanvas(){const rect=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#4c8a6c'}
function drawAll(strokes){resizeCanvas();ctx.clearRect(0,0,stage.clientWidth,stage.clientHeight);(strokes||[]).forEach(drawStroke)}
function drawStroke(st){if(!st||st.length<2)return;ctx.beginPath();ctx.moveTo(st[0].x*stage.clientWidth,st[0].y*stage.clientHeight);for(let i=1;i<st.length;i++)ctx.lineTo(st[i].x*stage.clientWidth,st[i].y*stage.clientHeight);ctx.stroke()}
function pointFromEvent(e){const r=stage.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
canvas.addEventListener('pointerdown',e=>{if(currentRound()?.type!=='trace'||role==='parent')return;e.preventDefault();drawActive=true;canvas.setPointerCapture?.(e.pointerId);currentStroke=[pointFromEvent(e)];data().strokes=data().strokes||[];data().strokes.push(currentStroke);send({type:'stroke',phase:'start',p:currentStroke[0],key:key()});drawAll(data().strokes)});
canvas.addEventListener('pointermove',e=>{if(!drawActive)return;e.preventDefault();const p=pointFromEvent(e);currentStroke.push(p);drawAll(data().strokes);const now=performance.now();if(now-lastPointSent>35){send({type:'stroke',phase:'move',p,key:key()});lastPointSent=now}});
function endStroke(){if(!drawActive)return;drawActive=false;if(currentStroke&&currentStroke.length){send({type:'stroke',phase:'end',p:currentStroke[currentStroke.length-1],key:key()});const a=currentStroke[0],b=currentStroke[currentStroke.length-1];if(Math.hypot(a.x-.12,a.y-.76)<.16&&Math.hypot(b.x-.87,b.y-.23)<.18){state.done=true;showFeedback('👍 Молодец!','good')}else showFeedback('👎 Попробуй ещё','try');touchState()}currentStroke=null}
canvas.addEventListener('pointerup',endStroke);canvas.addEventListener('pointercancel',endStroke);
function receiveStroke(m){if(m.key!==key()||currentRound()?.type!=='trace')return;const d=data();d.strokes=d.strokes||[];if(m.phase==='start'){remoteStroke=[m.p];d.strokes.push(remoteStroke)}else if(m.phase==='move'&&remoteStroke)remoteStroke.push(m.p);else if(m.phase==='end'&&remoteStroke){remoteStroke.push(m.p);remoteStroke=null}drawAll(d.strokes)}
function clearTrace(){if(currentRound()?.type!=='trace')return;data().strokes=[];state.done=false;touchState();render()}
$('#clearBtn').onclick=clearTrace;$('#childClear').onclick=clearTrace;

function renderCollect(r){const d=data();d.found=d.found||[];const total=r.targets.length,emo=r.counterEmoji||'✓';stageInner.innerHTML=`<div class="collect-board"><div class="counter-pill">${emo} ${d.found.length}/${total}</div>${r.items.map(([id,e,x,y])=>`<button class="collect-item ${d.found.includes(id)?'found':''}" data-id="${id}" style="left:${x}%;top:${y}%">${e}</button>`).join('')}</div>`;$$('.collect-item').forEach(btn=>{btn.disabled=role==='parent'||btn.classList.contains('found');if(role!=='parent')btn.onclick=()=>{sendPointerFrom(btn);const id=btn.dataset.id;if(r.targets.includes(id)){if(!d.found.includes(id))d.found.push(id);showFeedback('👍 Молодец!','good');if(r.targets.every(x=>d.found.includes(x)))state.done=true;touchState();render()}else showFeedback('👎 '+(r.wrongText||'Попробуй ещё'),'try')}})}

function shuffledRightOrder(r,d){
 if(Array.isArray(d.rightOrder) && d.rightOrder.length===r.pairs.length) return d.rightOrder;
 let a=r.pairs.map((_,i)=>i);
 for(let tries=0;tries<12;tries++){
   for(let i=a.length-1;i>0;i--){
     const j=Math.floor(Math.random()*(i+1));
     [a[i],a[j]]=[a[j],a[i]];
   }
   if(a.every((v,i)=>v!==i)) break;
 }
 if(!a.every((v,i)=>v!==i)) a=a.slice(1).concat(a[0]);
 d.rightOrder=a;
 state.updatedAt=Date.now();
 sendState();
 return a;
}

function renderMatch(r){
 const d=data();d.matched=d.matched||[];d.pick=d.pick||null;
 const left=r.pairs.map(p=>[p[0],p[1]]);
 const order=shuffledRightOrder(r,d);
 const right=order.map(i=>[r.pairs[i][2],r.pairs[i][3]]);
 stageInner.innerHTML=`<div class="match-board"><div class="match-col">${left.map(([id,e])=>`<button class="match-item ${d.matched.includes(id)?'matched':''} ${d.pick===id?'active':''}" data-side="left" data-id="${id}">${e}</button>`).join('')}</div><div class="match-col">${right.map(([id,e])=>`<button class="match-item ${d.matched.includes(id)?'matched':''}" data-side="right" data-id="${id}">${e}</button>`).join('')}</div></div>`;
 $$('.match-item').forEach(btn=>{
   btn.disabled=role==='parent'||btn.classList.contains('matched');
   if(role!=='parent')btn.onclick=()=>{
     sendPointerFrom(btn);
     const side=btn.dataset.side,id=btn.dataset.id;
     if(side==='left'){d.pick=id;touchState();render();return}
     if(!d.pick){showFeedback('👈 Сначала выбери слева','try');return}
     const pair=r.pairs.find(p=>p[0]===d.pick);
     if(pair&&pair[2]===id){
       d.matched.push(pair[0],pair[2]);d.pick=null;
       showFeedback('👍 Пара!','good');
       if(r.pairs.every(p=>d.matched.includes(p[0])&&d.matched.includes(p[2])))state.done=true;
       touchState();render();
     }else{
       btn.classList.add('wrong');
       showFeedback('👎 Попробуй другую пару','try');
       setTimeout(()=>btn.classList.remove('wrong'),450);
     }
   };
 });
}

function advance(){if(state.finished)return;const b=blocks[state.block];if(state.round<b.rounds.length-1){state.round++}else if(state.block<blocks.length-1){state.block++;state.round=0}else{finishLesson();return}state.done=false;state.updatedAt=Date.now();sendState();render()}
function back(){if(state.round>0)state.round--;else if(state.block>0){state.block--;state.round=blocks[state.block].rounds.length-1}else return;state.done=!!(state.roundData[key()]?.completed);state.updatedAt=Date.now();sendState();render()}
function updateNextControls(){
 const next=$('#skipBtn'),force=$('#forceNextBtn');
 if(!next||!force)return;
 const b=blocks[state.block];
 const last=!!b && state.block===blocks.length-1 && state.round===b.rounds.length-1;
 next.textContent=last?'Завершить урок 🎉':'Дальше →';
 next.disabled=!state.done;
 force.style.display=state.done?'none':'inline-block';
}
continueRound.onclick=()=>{if(!state.done)return;data().completed=true;advance()};
$('#skipBtn').onclick=()=>{if(!state.done)return;data().completed=true;advance()};
$('#forceNextBtn').onclick=()=>{data().completed=false;advance()};
$('#prevBtn').onclick=back;
$('#praiseBtn').onclick=()=>{showFeedback('👍 Молодец!','good');send({type:'praise'})};

function finishLesson(){state.finished=true;state.updatedAt=Date.now();sendState();showFinish()}
function showFinish(){$('#taskCard').classList.add('hidden');controls.style.display='none';childTools.style.display='none';const f=$('#finishCard');f.classList.add('active');updateAlbum();$$('.sticker').forEach(b=>{b.classList.remove('chosen');b.onclick=()=>chooseSticker(b.dataset.sticker,b)});}
function getAlbum(){try{return JSON.parse(localStorage.getItem('kidsLessonAlbum')||'[]')}catch{return[]}}
function updateAlbum(){const a=getAlbum();$('#albumList').textContent=a.length?a.join(' '):'Пока пусто'}
function chooseSticker(s,btn){$$('.sticker').forEach(x=>x.classList.remove('chosen'));btn.classList.add('chosen');let a=getAlbum();if(!a.includes(s))a.push(s);try{localStorage.setItem('kidsLessonAlbum',JSON.stringify(a))}catch{};$('#rewardResult').innerHTML=`<div class="reward-big">${s}</div><strong>Наклейка добавлена!</strong>`;$('#finishExit').style.display='inline-block';updateAlbum();send({type:'reward',sticker:s})}

window.addEventListener('resize',()=>{if(currentRound()?.type==='trace'&&!state.finished)drawAll(data().strokes||[])});
const qs=new URLSearchParams(location.search);if(qs.get('child')==='1'&&qs.get('room'))startChild(qs.get('room'));
})();
