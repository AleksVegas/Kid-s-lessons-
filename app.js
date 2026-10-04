(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const startScreen=$('#startScreen'),lessonScreen=$('#lessonScreen'),roleSelect=$('#roleSelect'),parentSetup=$('#parentSetup'),childSetup=$('#childSetup');
const stage=$('#stage'),stageInner=$('#stageInner'),canvas=$('#canvas'),ctx=canvas.getContext('2d'),pointerLayer=$('#pointerLayer');
const feedback=$('#feedback'),roundDone=$('#roundDone'),continueRound=$('#continueRound');
const progressTitle=$('#progressTitle'),progressRound=$('#progressRound'),blocksEl=$('#blocks'),taskIcon=$('#taskIcon'),step=$('#step'),taskTitle=$('#taskTitle'),taskSubtitle=$('#taskSubtitle');
const controls=$('#controls'),childTools=$('#childTools'),liveStatus=$('#liveStatus'),netNote=$('#netNote'),lessonHeaderTitle=$('#lessonHeaderTitle'),selectedLessonName=$('#selectedLessonName'),selectedLessonSetup=$('#selectedLessonSetup');
const demoViewSwitch=$('#demoViewSwitch'),demoChildView=$('#demoChildView'),demoParentView=$('#demoParentView'),retryChoiceBtn=$('#retryChoiceBtn'),hideMissingBtn=$('#hideMissingBtn');
let role='demo', room='', peer=null, conn=null, reconnectTimer=null, heartbeatTimer=null, connected=false;
let demoView='child',choiceLock=false,choiceUnlockGuardUntil=0,choiceUnlockGuardKey='';
let drawActive=false,currentStroke=null,remoteStroke=null,lastPointSent=0,feedbackTimer=null,dragCleanup=[];
let state={lessonId:'1',started:false,block:0,round:0,done:false,finished:false,updatedAt:Date.now(),roundData:{}};

const lesson1Blocks=[
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

const lesson2Blocks=[
 {name:'У берега',icon:'🌊',rounds:[
  {type:'choice',title:'Кто живёт в море?',subtitle:'Выбери морского жителя.',hint:'Кто плавает под водой?',correct:'fish',items:[['cat','🐱','Кот'],['fish','🐟','Рыбка'],['dog','🐶','Собака'],['rabbit','🐰','Зайчик']]},
  {type:'choice',title:'Что плавает по воде?',subtitle:'Найди транспорт для воды.',hint:'На чём можно плыть?',correct:'boat',items:[['car','🚗','Машина'],['train','🚆','Поезд'],['boat','⛵','Лодка'],['plane','✈️','Самолёт']]},
  {type:'choice',title:'Что защищает от солнца?',subtitle:'Выбери то, что надевают на голову.',hint:'Что надевают на голову?',correct:'cap',items:[['cap','🧢','Кепка'],['glove','🧤','Перчатка'],['boot','🥾','Ботинок'],['scarf','🧣','Шарф']]},
  {type:'choice',title:'Сколько ракушек?',subtitle:'Посчитай ракушки и выбери цифру.',visual:['🐚','🐚','🐚','🐚'],visualType:'count',hint:'Посчитай каждую ракушку.',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]}
 ]},
 {name:'Собираемся в путь',icon:'🎒',rounds:[
  {type:'sort',title:'Морские жители — в море',subtitle:'Перетащи в воду только тех, кто живёт в море.',target:'🌊',label:'Море',accept:['fish','octopus','dolphin'],items:[['fish','🐟'],['dog','🐶'],['octopus','🐙'],['cat','🐱'],['dolphin','🐬'],['butterfly','🦋']]},
  {type:'sort',title:'Собираем вещи на пляж',subtitle:'Положи в сумку только вещи для тёплого пляжа.',target:'🎒',label:'Сумка',accept:['cap','glasses','flipflops'],items:[['cap','🧢'],['scarf','🧣'],['glasses','🕶️'],['glove','🧤'],['flipflops','🩴'],['ski','🎿']]},
  {type:'collect',title:'Найди все ракушки',subtitle:'Нажми на все 3 ракушки.',targets:['s1','s2','s3'],counterEmoji:'🐚',wrongText:'Это не ракушка',items:[['s1','🐚',14,27],['fish','🐟',35,20],['s2','🐚',59,31],['crab','🦀',84,21],['star','⭐',24,71],['s3','🐚',49,68],['octopus','🐙',72,71],['sun','☀️',90,66]]}
 ]},
 {name:'Плывём',icon:'⛵',rounds:[
  {type:'trace',title:'Доплыви до острова',subtitle:'Проведи лодку по дорожке к острову.',start:'⛵',end:'🏝️',path:'M95 360 C190 330 145 235 280 235 S430 315 495 200 S650 120 760 110'},
  {type:'trace',title:'Помоги дельфину',subtitle:'Проведи дельфина по дорожке к волне.',start:'🐬',end:'🌊',path:'M95 360 C170 270 235 345 320 260 S455 150 520 220 S650 280 760 110'},
  {type:'match',title:'Кто где бывает?',subtitle:'Нажми слева, потом выбери подходящее место справа.',pairs:[['fish','🐟','water','🌊'],['crab','🦀','beach','🏖️'],['bird','🐦','sky','☁️']]}
 ]},
 {name:'Морская логика',icon:'🧠',rounds:[
  {type:'choice',title:'Найди лишнее',subtitle:'Три картинки — морские животные. Одна лишняя.',hint:'Кто не живёт в море?',correct:'cow',items:[['fish','🐟',''],['dolphin','🐬',''],['cow','🐮',''],['octopus','🐙','']]},
  {type:'choice',title:'Найди лишнее',subtitle:'Три картинки — транспорт. Одна лишняя.',hint:'Что не является транспортом?',correct:'fish',items:[['car','🚗',''],['boat','⛵',''],['fish','🐟',''],['plane','✈️','']]},
  {type:'choice',title:'Что будет дальше?',subtitle:'Посмотри на ряд и выбери следующую картинку.',visual:['🌊','☀️','🌊','☀️','❓'],visualType:'sequence',hint:'Картинки идут по очереди.',correct:'wave',items:[['sun','☀️',''],['wave','🌊',''],['shell','🐚',''],['fish','🐟','']]},
  {type:'choice',title:'Сколько рыбок?',subtitle:'Посчитай рыбок и выбери цифру.',visual:['🐟','🐟','🐟','🐟'],visualType:'count',hint:'Посчитай рыбок по одной.',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]}
 ]},
 {name:'Остров сокровищ',icon:'🏆',rounds:[
  {type:'collect',title:'Найди сокровища',subtitle:'Найди и нажми на все 4 драгоценных камня.',targets:['g1','g2','g3','g4'],counterEmoji:'💎',wrongText:'Это не сокровище',items:[['g1','💎',13,24],['fish','🐟',34,19],['g2','💎',57,28],['crab','🦀',82,20],['g3','💎',23,70],['boat','⛵',45,72],['g4','💎',69,66],['shell','🐚',89,72]]},
  {type:'choice',title:'Сколько сокровищ нашли?',subtitle:'Посчитай камни и выбери цифру.',visual:['💎','💎','💎','💎'],visualType:'count',hint:'Посчитай все камни.',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]},
  {type:'match',title:'Последние морские пары',subtitle:'Собери 3 пары.',pairs:[['boat','⛵','anchor','⚓'],['fish','🐟','water','🌊'],['palm','🌴','island','🏝️']]},
  {type:'trace',title:'Проводим черепашку на остров',subtitle:'Последняя дорожка — и морское путешествие закончено!',start:'🐢',end:'🏝️',path:'M95 360 C175 315 190 220 305 250 S430 340 505 235 S660 135 760 110'}
 ]}
];

const lessons={
 '1':{id:'1',title:'Урок 1: Лесное приключение',short:'Урок 1 • Лесное приключение',blocks:lesson1Blocks,stickers:['⭐','🚀','🦖']},
 '2':{id:'2',title:'Урок 2: Морское путешествие',short:'Урок 2 • Морское путешествие',blocks:lesson2Blocks,stickers:['🐠','🐢','⚓']},
 '3':{id:'3',title:'Урок 3: Приключение в зоопарке',short:'Урок 3 • Приключение в зоопарке',blocks:(window.lesson3Blocks||[]),stickers:['🦁','🐼','🦒']},
 '4':{id:'4',title:'Урок 4: День на ферме',short:'Урок 4 • День на ферме',blocks:(window.lesson4Blocks||[]),stickers:['🐄','🐔','🚜']},
 '5':{id:'5',title:'Урок 5: Город и транспорт',short:'Урок 5 • Город и транспорт',blocks:(window.lesson5Blocks||[]),stickers:['🚒','🚦','🏙️']}
};
let lessonId='1',blocks=lesson1Blocks;
function applyLesson(id){
 lessonId=lessons[id]?String(id):'1';
 blocks=lessons[lessonId].blocks;
 $$('.lesson-card').forEach(b=>b.classList.toggle('selected',b.dataset.lesson===lessonId));
 if(selectedLessonName)selectedLessonName.textContent=lessons[lessonId].title;
 if(selectedLessonSetup)selectedLessonSetup.textContent=lessons[lessonId].title;
 if(lessonHeaderTitle)lessonHeaderTitle.textContent=lessons[lessonId].short;
 document.body.classList.toggle('lesson3-active',lessonId==='3'||lessonId==='4'||lessonId==='5');
 document.body.classList.toggle('lesson5-active',lessonId==='5');
}


function viewRole(){return role==='demo'?demoView:role}
function applyViewMode(){
 const v=viewRole();
 document.body.classList.toggle('view-child',v==='child');
 document.body.classList.toggle('view-parent',v==='parent');
 if(demoViewSwitch)demoViewSwitch.style.display=role==='demo'?'flex':'none';
 if(demoChildView)demoChildView.classList.toggle('active',role==='demo'&&demoView==='child');
 if(demoParentView)demoParentView.classList.toggle('active',role==='demo'&&demoView==='parent');
 if(lessonScreen.classList.contains('active')){
   controls.style.display=v==='parent'?'flex':'none';
   const r=currentRound();
   childTools.style.display=(v==='child'&&(r?.type==='trace'||r?.type==='circle'))?'block':'none';
 }
}

function key(){return `${state.block}-${state.round}`}
function data(){if(!state.roundData[key()]) state.roundData[key()]={}; return state.roundData[key()]}
function touchState(){state.updatedAt=Date.now();updateNextControls();if(role==='child'&&state.done)send({type:'taskDone',key:key(),roundData:data()});sendState()}
function setStatus(el,kind,text){el.className='status '+kind;el.innerHTML='<span class="dot"></span><span>'+text+'</span>'}
function showSetup(which){roleSelect.style.display='none';parentSetup.classList.toggle('active',which==='parent');childSetup.classList.toggle('active',which==='child')}
function resetHome(){try{conn?.close()}catch{};try{peer?.destroy()}catch{};clearTimeout(reconnectTimer);clearInterval(heartbeatTimer);peer=conn=null;connected=false;roleSelect.style.display='block';parentSetup.classList.remove('active');childSetup.classList.remove('active');startScreen.style.display='block';lessonScreen.classList.remove('active');document.body.classList.remove('lesson-open','needs-landscape','child-role','view-child','view-parent','lesson3-active','lesson5-active');}
$$('.backBtn').forEach(b=>b.onclick=resetHome);$('#exitLesson').onclick=resetHome;$('#finishExit').onclick=resetHome;

function freshState(){state={lessonId,started:false,block:0,round:0,done:false,finished:false,updatedAt:Date.now(),roundData:{}}}
$$('.lesson-card').forEach(b=>b.onclick=()=>applyLesson(b.dataset.lesson));
applyLesson('1');
$('#demoRole').onclick=()=>{role='demo';demoView='child';freshState();enterLesson();};
if(demoChildView)demoChildView.onclick=()=>{if(role!=='demo')return;demoView='child';render()};
if(demoParentView)demoParentView.onclick=()=>{if(role!=='demo')return;demoView='parent';render()};
$('#parentRole').onclick=startParent;

function makeRoom(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function childUrl(){const base=location.href.split('?')[0].split('#')[0];return `${base}?child=1&room=${encodeURIComponent(room)}`}
function startParent(){role='parent';freshState();room=makeRoom();showSetup('parent');$('#shareLink').textContent=childUrl();$('#shareLink').dataset.url=childUrl();if(typeof Peer==='undefined'){setStatus($('#parentStatus'),'error','PeerJS не загрузился. Для локального теста используй тестовый режим.');return}const id='kidsv2-'+room.toLowerCase();peer=new Peer(id,{debug:0});peer.on('open',()=>setStatus($('#parentStatus'),'waiting','Ждём открытия ссылки у ребёнка'));peer.on('connection',c=>{if(conn&&conn.open)try{conn.close()}catch{};conn=c;setupConn(c)});peer.on('disconnected',()=>{try{peer.reconnect()}catch{};if(!(conn&&conn.open))setStatus($('#parentStatus'),'waiting','Восстанавливаем соединение…')});peer.on('error',e=>setStatus($('#parentStatus'),'error','Ошибка: '+e.type));}
$('#copyLinkBtn').onclick=async()=>{const u=$('#shareLink').dataset.url||$('#shareLink').textContent;try{await navigator.clipboard.writeText(u);$('#copyLinkBtn').textContent='Скопировано ✓'}catch{const t=document.createElement('textarea');t.value=u;document.body.append(t);t.select();document.execCommand('copy');t.remove();$('#copyLinkBtn').textContent='Скопировано ✓'}};
$('#parentEnterLesson').onclick=()=>{state.started=true;state.updatedAt=Date.now();sendState(true);enterLesson();};

function startChild(code){role='child';freshState();state.updatedAt=0;room=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);document.body.classList.add('child-role');showSetup('child');if(typeof Peer==='undefined'){setStatus($('#childStatus'),'error','Не удалось загрузить модуль связи');return}connectChildPeer();}
function connectChildPeer(){clearTimeout(reconnectTimer);if(peer&&!peer.destroyed){try{peer.destroy()}catch{}};peer=new Peer(undefined,{debug:0});peer.on('open',()=>connectToParent());peer.on('disconnected',()=>{try{peer.reconnect()}catch{};if(!(conn&&conn.open)){setStatus($('#childStatus'),'waiting','Восстанавливаем соединение…');scheduleReconnect()}});peer.on('error',e=>{if(e.type==='peer-unavailable'){setStatus($('#childStatus'),'waiting','Взрослый ещё не подключён. Повторяем…');scheduleReconnect()}else{setStatus($('#childStatus'),'waiting','Связь нестабильна. Повторяем…');scheduleReconnect()}});}
function connectToParent(){if(!peer||peer.destroyed)return;try{conn=peer.connect('kidsv2-'+room.toLowerCase(),{reliable:true,serialization:'json'});setupConn(conn)}catch{scheduleReconnect()}}
function scheduleReconnect(){clearTimeout(reconnectTimer);reconnectTimer=setTimeout(()=>{if(role==='child'&&!connected){if(peer&&peer.open)connectToParent();else connectChildPeer()}},2500)}

function setupConn(c){c.on('open',()=>{connected=true;if(role==='parent'){setStatus($('#parentStatus'),'online','Ребёнок подключён ✓');$('#parentEnterLesson').disabled=false}else{setStatus($('#childStatus'),'online',state.started?'Подключено ✓':'Подключено ✓ Ждём начала урока')}setLive(true);send({type:'hello'});if(role==='parent')sendState(true);clearInterval(heartbeatTimer);heartbeatTimer=setInterval(()=>send({type:'ping'}),12000)});c.on('data',handleMsg);c.on('close',()=>{connected=false;setLive(false);if(role==='child')scheduleReconnect();else setStatus($('#parentStatus'),'waiting','Связь потеряна. Ждём переподключения…')});c.on('error',()=>{connected=false;setLive(false);if(role==='child')scheduleReconnect()})}
function send(obj){if(conn&&conn.open)try{conn.send(obj)}catch{}}
function clone(v){return JSON.parse(JSON.stringify(v))}
function sendState(force=false){send({type:'snapshot',state,source:role,force})}
function mergeChildProgress(child){
 if(!child||child.block!==state.block||child.round!==state.round)return;
 const k=key(),childRound=child.roundData&&child.roundData[k];
 if(choiceUnlockGuardKey===k&&Date.now()<choiceUnlockGuardUntil&&childRound?.locked)return;
 if(childRound)state.roundData[k]=clone(childRound);
 state.done=state.done||!!child.done;
 state.updatedAt=Math.max(state.updatedAt||0,child.updatedAt||0);
 if(lessonScreen.classList.contains('active'))render();else updateNextControls()
}
function handleMsg(m){
 if(!m||typeof m!=='object')return;
 if(m.type==='ping')return;
 if(m.type==='hello'){if(role==='parent')sendState(true);return}
 if(m.type==='snapshot'&&m.state){
   if(role==='child'&&m.source==='parent'){
     state=clone(m.state);applyLesson(state.lessonId||'1');
     if(state.started){if(!lessonScreen.classList.contains('active'))enterLesson();else render()}
     else setStatus($('#childStatus'),'online','Подключено ✓ Ждём начала урока');
     return
   }
   if(role==='parent'&&m.source==='child'){mergeChildProgress(m.state);return}
 }
 if(m.type==='choiceUnlock'&&role==='child'&&m.key===key()){resetChoiceAttempts(false);return}
 if(m.type==='taskDone'&&role==='parent'&&m.key===key()){
   if(m.roundData)state.roundData[key()]=clone(m.roundData);
   state.done=true;updateNextControls();
   if(lessonScreen.classList.contains('active'))render();
   return
 }
 if(m.type==='praise'){showFeedback('👍 Молодец!','good');return}
 if(m.type==='strokeComplete'){receiveStrokeComplete(m);return}
 if(m.type==='pointer'){showPointer(m.x,m.y);return}
}
function setLive(ok){if(role==='demo'){setStatus(liveStatus,'online','Тестовый режим');netNote.textContent='';return}if(ok){setStatus(liveStatus,'online','На связи');netNote.textContent=''}else{setStatus(liveStatus,'waiting','Переподключаемся…');netNote.textContent=role==='child'?'Можно продолжать урок — прогресс не пропадёт.':'Экран останется на месте.'}}
window.addEventListener('online',()=>{if(role!=='demo'&&!connected){setLive(false);if(role==='child')scheduleReconnect()}});window.addEventListener('offline',()=>{if(role!=='demo'){connected=false;setLive(false)}});

function enterLesson(){
 applyLesson(state.lessonId||lessonId);
 startScreen.style.display='none';
 lessonScreen.classList.add('active');
 document.body.classList.add('lesson-open','needs-landscape');
 setLive(connected||role==='demo');
 render()
}
function currentRound(){return blocks[state.block]?.rounds[state.round]}
function render(){cleanupDrag();if(state.finished){showFinish();return}$('#taskCard').classList.remove('hidden');$('#finishCard').classList.remove('active');const b=blocks[state.block],r=currentRound();if(!b||!r){finishLesson();return}progressTitle.textContent=`Блок ${state.block+1} из ${blocks.length} • ${b.name}`;progressRound.textContent=`Раунд ${state.round+1} из ${b.rounds.length}`;step.textContent=`${b.name} · ${state.round+1}/${b.rounds.length}`;taskIcon.textContent=b.icon;taskTitle.textContent=r.title;taskSubtitle.textContent=r.subtitle;blocksEl.innerHTML=blocks.map((_,i)=>`<div class="block-dot ${i<state.block?'done':i===state.block?'active':''}"></div>`).join('');stageInner.innerHTML='';pointerLayer.innerHTML='';canvas.style.pointerEvents='none';canvas.style.display='none';roundDone.classList.remove('show');continueRound.textContent=(state.block===blocks.length-1&&state.round===b.rounds.length-1)?'Завершить урок 🎉':(state.round===b.rounds.length-1?'Следующий блок →':'Продолжить →');$('#clearBtn').style.display=(r.type==='trace'||r.type==='circle')?'inline-block':'none';$('#childClear').style.display=(r.type==='trace'||r.type==='circle')?'inline-block':'none';$('#prevBtn').disabled=state.block===0&&state.round===0;renderRound(r);applyViewMode();updateNextControls();}
function renderRound(r){if(r.type==='choice')renderChoice(r);else if(r.type==='sort')renderSort(r);else if(r.type==='trace')renderTrace(r);else if(r.type==='collect')renderCollect(r);else if(r.type==='match')renderMatch(r);else if(r.type==='learn')renderLearn(r);else if(r.type==='sort2')renderSort2(r);else if(r.type==='memory')renderMemory(r);else if(r.type==='order')renderOrder(r);else if(r.type==='missing')renderMissing(r);else if(r.type==='sizeorder')renderSizeOrder(r);else if(r.type==='circle')renderCircle(r)}
function showFeedback(text,kind='good'){clearTimeout(feedbackTimer);feedback.textContent=text;feedback.className='feedback show '+kind;feedbackTimer=setTimeout(()=>feedback.className='feedback',1400)}
function showPointer(x,y){const p=document.createElement('div');p.className='remote-pointer';p.style.left=(x*100)+'%';p.style.top=(y*100)+'%';pointerLayer.appendChild(p);setTimeout(()=>p.remove(),600)}
function sendPointerFrom(el){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();send({type:'pointer',x:(r.left+r.width/2-s.left)/s.width,y:(r.top+r.height/2-s.top)/s.height})}

function renderChoice(r){
 const d=data(),v=viewRole();
 d.wrong=Array.isArray(d.wrong)?d.wrong:[];
 d.strikes=Number.isFinite(d.strikes)?d.strikes:(d.errors||0);
 d.locked=!!d.locked;
 const makeChoice=([id,e,l],extra='')=>`<button class="choice ${extra} ${d.selected===id?'selected':''} ${d.wrong.includes(id)?'used-wrong':''}" data-id="${id}" ${v==='parent'||state.done||d.locked||d.wrong.includes(id)?'disabled':''}><div class="emo">${e}</div>${l?`<div class="lab">${l}</div>`:''}</button>`;
 if(r.visual){
   const isSequence=r.visualType==='sequence';
   const visualHTML=isSequence
     ? `<div class="sequence-objects">${r.visual.map(e=>`<div class="sequence-object">${e}</div>`).join('')}</div>`
     : `<div class="count-objects ${r.visual.length===3?'three':''}">${r.visual.map(e=>`<div class="count-object">${e}</div>`).join('')}</div>`;
   const answersHTML=r.items.map(x=>makeChoice(x,'visual-answer')).join('');
   if(isSequence){
     stageInner.innerHTML=`<div class="visual-board lesson-sequence-side"><div class="sequence-zone"><div class="zone-label">Ряд</div>${visualHTML}</div><div class="answer-zone"><div class="zone-label">Выбери</div><div class="visual-answers">${answersHTML}</div></div></div>`
   }else{
     stageInner.innerHTML=`<div class="visual-board"><div class="visual-main">${visualHTML}</div><div class="visual-answers">${answersHTML}</div></div>`
   }
 }else{
   stageInner.innerHTML=`<div class="choices">${r.items.map(x=>makeChoice(x)).join('')}</div>`
 }
 if(v==='child'&&d.locked)stageInner.insertAdjacentHTML('beforeend','<div class="choice-wait-overlay"><div>Подожди взрослого 👋<small>Обсудите задание, потом будет ещё попытка.</small></div></div>');
 if(v==='parent')return;
 $$('.choice').forEach(btn=>{
   if(btn.disabled)return;
   btn.onclick=()=>{
     if(state.done||choiceLock||d.locked||d.wrong.includes(btn.dataset.id))return;
     sendPointerFrom(btn);
     const id=btn.dataset.id;
     if(id===r.correct){
       d.selected=id;$$('.choice').forEach(x=>x.classList.toggle('selected',x===btn));
       state.done=true;showFeedback('👍 Молодец!','good');touchState();return
     }
     d.selected=null;
     if(!d.wrong.includes(id))d.wrong.push(id);
     d.strikes++;d.errors=d.strikes;state.done=false;choiceLock=true;
     $$('.choice').forEach(x=>x.disabled=true);btn.classList.add('wrong','used-wrong');
     if(d.strikes>=2){
       d.locked=true;showFeedback('Подожди взрослого','try');touchState();
       setTimeout(()=>{choiceLock=false;render()},650)
     }else{
       showFeedback('👎 Попробуй ещё','try');touchState();
       setTimeout(()=>{choiceLock=false;render()},1400)
     }
   }
 })
}
function renderSoon(){}

function renderSort(r){
 const d=data();d.placed=d.placed||[];
 const placed=r.items.filter(([id])=>d.placed.includes(id)).map(([,e])=>`<span>${e}</span>`).join('');
 stageInner.innerHTML=`<div class="sort-board"><div class="sort-items">${r.items.map(([id,e])=>`<div class="drag-item ${d.placed.includes(id)?'placed':''}" data-id="${id}">${e}</div>`).join('')}</div><div id="dropZone" class="drop-zone"><div>${r.target}</div><div class="drop-label">${r.label}</div><div class="drop-placed">${placed}</div></div></div>`;
 if(viewRole()!=='parent')initDrag(r)
}
function cleanupDrag(){dragCleanup.forEach(fn=>{try{fn()}catch{}});dragCleanup=[];$$('.sort2-ghost').forEach(x=>x.remove())}
function initDrag(r){const zone=$('#dropZone');$$('.drag-item').forEach(item=>{if(item.classList.contains('placed'))return;let dragging=false,startX=0,startY=0,origin=null;const down=e=>{e.preventDefault();dragging=true;item.setPointerCapture?.(e.pointerId);const rc=item.getBoundingClientRect();origin={parent:item.parentNode,next:item.nextSibling,style:item.getAttribute('style')||''};startX=e.clientX-rc.left;startY=e.clientY-rc.top;item.style.position='fixed';item.style.left=(e.clientX-startX)+'px';item.style.top=(e.clientY-startY)+'px';item.style.width=rc.width+'px';item.style.height=rc.height+'px';item.style.zIndex=99;document.body.appendChild(item)};const move=e=>{if(!dragging)return;e.preventDefault();item.style.left=(e.clientX-startX)+'px';item.style.top=(e.clientY-startY)+'px';const z=zone.getBoundingClientRect();zone.classList.toggle('active',e.clientX>=z.left&&e.clientX<=z.right&&e.clientY>=z.top&&e.clientY<=z.bottom)};const up=e=>{if(!dragging)return;dragging=false;const z=zone.getBoundingClientRect(),inside=e.clientX>=z.left&&e.clientX<=z.right&&e.clientY>=z.top&&e.clientY<=z.bottom;const id=item.dataset.id;zone.classList.remove('active');if(origin.next&&origin.next.parentNode===origin.parent)origin.parent.insertBefore(item,origin.next);else origin.parent.appendChild(item);item.setAttribute('style',origin.style);if(inside){if(r.accept.includes(id)){const d=data();if(!d.placed.includes(id))d.placed.push(id);showFeedback('👍 Молодец!','good');if(r.accept.every(x=>d.placed.includes(x)))state.done=true;touchState();render()}else{showFeedback('👎 Не сюда','try')}}};item.addEventListener('pointerdown',down);item.addEventListener('pointermove',move);item.addEventListener('pointerup',up);item.addEventListener('pointercancel',up);dragCleanup.push(()=>{item.removeEventListener('pointerdown',down);item.removeEventListener('pointermove',move);item.removeEventListener('pointerup',up);item.removeEventListener('pointercancel',up)})})}


function renderLearn(r){
 const v=viewRole(),words=r.name.trim().split(/\s+/),firstWord=words[0],tail=words.slice(1).join(' '),isLong=r.name.length>10;
 const nameHTML=`<span class="name-word"><span class="first" style="color:${r.color}">${r.first}</span>${firstWord.slice(1)}</span>${tail?`<span class="name-rest">${tail}</span>`:''}`;
 const child=`<section class="learn-child-view"><div class="learn-photo"><img src="${r.photo}" alt="${r.name}" decoding="async" fetchpriority="high" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="learn-fallback">${r.fallback}</div></div><div class="learn-name ${isLong?'long-name':''} ${tail?'multi-word':''}">${nameHTML}</div></section>`;
 const credit=r.credit?`<div class="photo-credit">${r.credit}</div>`:'';
 const adult=`<section class="learn-parent-view"><div class="learn-parent-kicker">Экран взрослого • что сказать и спросить</div><div class="learn-row"><strong>Сначала спроси</strong><span>1. ${r.ask[0]}<br>2. ${r.ask[1]}</span></div><div class="learn-row hint"><strong>Мягкая подсказка</strong><span>${r.hint}</span></div><div class="learn-row fact"><strong>После ответа ребёнка</strong><span>${r.fact}</span></div>${credit}</section>`;
 stageInner.innerHTML=`<div class="learn-card learn-single">${v==='child'?child:adult}</div>`;
 if(!state.done){
   state.done=true;state.updatedAt=Date.now();updateNextControls();
   if(role==='parent')sendState(true)
 }
}
function renderSort2(r){
 const d=data(),v=viewRole();d.placed=d.placed||{};
 const placedFor=zid=>r.items.filter(x=>d.placed[x[0]]===zid).map(x=>`<span>${x[1]}</span>`).join('');
 stageInner.innerHTML=`<div class="sort2-board ${v==='parent'?'parent-mirror':''}"><div class="sort2-items">${r.items.map(([id,e])=>`<div class="sort2-item ${d.placed[id]?'placed':''}" data-id="${id}">${e}</div>`).join('')}</div><div class="sort2-zones">${r.zones.map(([id,e,l])=>`<div class="sort2-zone" data-zone="${id}"><div>${e}</div><small>${l}</small><div class="sort2-zone-placed">${placedFor(id)}</div></div>`).join('')}</div></div>`;
 if(v==='parent')return;
 $$('.sort2-item').forEach(el=>{
  if(el.classList.contains('placed'))return;
  let ghost=null,go=false,ox=0,oy=0;
  const move=e=>{if(!go||!ghost)return;ghost.style.left=(e.clientX-ox)+'px';ghost.style.top=(e.clientY-oy)+'px';$$('.sort2-zone').forEach(z=>{const q=z.getBoundingClientRect();z.classList.toggle('hot',e.clientX>=q.left&&e.clientX<=q.right&&e.clientY>=q.top&&e.clientY<=q.bottom)})};
  const up=e=>{if(!go)return;go=false;let hit=null;$$('.sort2-zone').forEach(z=>{const q=z.getBoundingClientRect();if(e.clientX>=q.left&&e.clientX<=q.right&&e.clientY>=q.top&&e.clientY<=q.bottom)hit=z;z.classList.remove('hot')});ghost?.remove();ghost=null;el.style.opacity='';if(hit){const target=r.items.find(v=>v[0]===el.dataset.id)?.[2];if(hit.dataset.zone===target){d.placed[el.dataset.id]=target;showFeedback('👍 Верно!','good');if(r.items.every(v=>d.placed[v[0]]))state.done=true;touchState();render()}else showFeedback('👎 Другая группа','try')}};
  const down=e=>{e.preventDefault();go=true;const q=el.getBoundingClientRect();ox=e.clientX-q.left;oy=e.clientY-q.top;ghost=el.cloneNode(true);ghost.className='sort2-ghost';Object.assign(ghost.style,{left:q.left+'px',top:q.top+'px',width:q.width+'px',height:q.height+'px'});document.body.appendChild(ghost);el.style.opacity='.25';el.setPointerCapture?.(e.pointerId)};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  dragCleanup.push(()=>{el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);ghost?.remove()});
 })
}
let memoryLock=false;
function renderMemory(r){
 const d=data();
 if(!d.cards){d.cards=r.cards.map((e,i)=>({e,i}));for(let i=d.cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d.cards[i],d.cards[j]]=[d.cards[j],d.cards[i]]}d.open=[];d.matched=[];touchState()}
 stageInner.innerHTML=`<div class="memory-board">${d.cards.map((c,i)=>`<button class="memory-card ${d.open.includes(i)?'open':''} ${d.matched.includes(i)?'matched':''}" data-i="${i}">${c.e}</button>`).join('')}</div>`;
 $$('.memory-card').forEach(btn=>{btn.disabled=viewRole()==='parent';if(viewRole()!=='parent')btn.onclick=()=>{if(memoryLock)return;const i=+btn.dataset.i;if(d.open.includes(i)||d.matched.includes(i))return;d.open.push(i);touchState();render();if(d.open.length===2){memoryLock=true;const [a,b]=d.open;if(d.cards[a].e===d.cards[b].e)setTimeout(()=>{d.matched.push(a,b);d.open=[];memoryLock=false;if(d.matched.length===d.cards.length)state.done=true;showFeedback('👍 Пара!','good');touchState();render()},350);else setTimeout(()=>{d.open=[];memoryLock=false;showFeedback('Попробуй ещё','try');touchState();render()},650)}}})
}

function renderOrder(r){
 const d=data();d.slots=d.slots||[];d.pick=d.pick||null;
 stageInner.innerHTML=`<div class="order-board"><div class="order-slots">${[0,1,2].map(i=>`<button class="order-slot ${d.slots[i]?'filled':''}" data-i="${i}">${d.slots[i]?r.items.find(v=>v[0]===d.slots[i])[1]:i+1}</button>`).join('')}</div><div class="order-pool">${r.items.map(([id,e])=>`<button class="order-item ${d.slots.includes(id)?'used':''} ${d.pick===id?'picked':''}" data-id="${id}">${e}</button>`).join('')}</div></div>`;
 $$('.order-item').forEach(btn=>{btn.disabled=viewRole()==='parent';if(viewRole()!=='parent')btn.onclick=()=>{d.pick=btn.dataset.id;touchState();render()}});
 $$('.order-slot').forEach(btn=>{btn.disabled=viewRole()==='parent';if(viewRole()!=='parent')btn.onclick=()=>{const i=+btn.dataset.i;if(!d.pick){if(d.slots[i]){d.slots[i]=null;state.done=false;touchState();render()}else showFeedback('Сначала выбери картинку','try');return}d.slots[i]=d.pick;d.pick=null;if(d.slots.filter(Boolean).length===3){if(d.slots.every((v,i)=>v===r.answer[i])){state.done=true;showFeedback('👍 Правильный порядок!','good')}else{state.done=false;showFeedback('Пока не так. Можно поменять.','try')}}touchState();render()}});
}


function renderMissing(r){
 const d=data(),v=viewRole();d.phase=d.phase||'look';d.wrong=Array.isArray(d.wrong)?d.wrong:[];
 const hidden=r.items.find(x=>x[0]===r.hidden);
 if(v==='parent'){
   stageInner.innerHTML=d.phase==='look'
    ? `<div class="new-parent-card"><div><strong>Сначала дай ребёнку запомнить</strong><p>На детском экране сейчас видны все четыре картинки.</p><span>${r.items.map(x=>x[1]).join(' ')}</span><p>Когда ребёнок готов, нажми внизу <b>«Спрятать одну»</b>.</p></div></div>`
    : `<div class="new-parent-card"><div><strong>Что исчезло?</strong><p>Одна картинка уже скрыта на детском экране.</p><span>${hidden?hidden[1]:'❓'}</span><p>Правильный ответ показан выше только взрослому. Не подсказывай сразу.</p></div></div>`;
   return
 }
 if(d.phase==='look'){
   stageInner.innerHTML=`<div class="missing-board"><div class="missing-row">${r.items.map(([_id,e])=>`<div class="missing-card">${e}</div>`).join('')}</div><div class="missing-wait">👀 Запомни картинки — взрослый скоро спрячет одну</div></div>`;
   return
 }
 const visible=r.items.filter(x=>x[0]!==r.hidden),scene=[...visible,['blank','❓']];
 stageInner.innerHTML=`<div class="missing-quiz"><div class="missing-scene">${scene.map(([id,e])=>`<div class="missing-card ${id==='blank'?'missing-blank':''}">${e}</div>`).join('')}</div><div class="missing-answers">${r.items.map(([id,e])=>`<button class="missing-answer ${d.wrong.includes(id)?'wrong':''}" data-id="${id}" ${state.done||d.wrong.includes(id)?'disabled':''}>${e}</button>`).join('')}</div></div>`;
 $('.missing-answer').forEach(btn=>{if(btn.disabled)return;btn.onclick=()=>{
   sendPointerFrom(btn);const id=btn.dataset.id;
   if(id===r.hidden){state.done=true;showFeedback('👍 Точно! Это исчезло','good')}
   else{if(!d.wrong.includes(id))d.wrong.push(id);state.done=false;showFeedback('👎 Вспомни ещё','try')}
   touchState();render()
 }})
}
function renderSizeOrder(r){
 const d=data(),v=viewRole();d.s=Array.isArray(d.s)?d.s:[];d.pick=d.pick||null;
 const labels=['Маленький','Средний','Большой'];
 stageInner.innerHTML=`<div class="size-board"><div class="size-slots">${[0,1,2].map(i=>`<button class="size-slot ${d.s[i]?'filled':''}" data-i="${i}" ${v==='parent'?'disabled':''}><span class="size-label">${labels[i]}</span><span class="size-content">${d.s[i]?r.items.find(x=>x[0]===d.s[i])?.[1]:'?'}</span></button>`).join('')}</div><div class="size-pool">${r.items.map(([id,e])=>`<button class="size-item ${d.s.includes(id)?'used':''} ${d.pick===id?'picked':''}" data-id="${id}" ${v==='parent'?'disabled':''}>${e}</button>`).join('')}</div></div>`;
 if(v==='parent')return;
 $('.size-item').forEach(btn=>{if(btn.disabled)return;btn.onclick=()=>{d.pick=btn.dataset.id;state.updatedAt=Date.now();sendState();render()}});
 $('.size-slot').forEach(btn=>{btn.onclick=()=>{
   const i=+btn.dataset.i;
   if(!d.pick){if(d.s[i]){d.s[i]=null;state.done=false;touchState();render()}else showFeedback('Сначала выбери транспорт','try');return}
   const old=d.s.indexOf(d.pick);if(old>=0)d.s[old]=null;
   d.s[i]=d.pick;d.pick=null;state.done=false;
   if(d.s.filter(Boolean).length===3){
     if(d.s.every((x,j)=>x===r.answer[j])){state.done=true;showFeedback('👍 От маленького к большому!','good')}
     else showFeedback('Посмотри на размеры ещё раз','try')
   }
   touchState();render()
 }})
}

function renderCircle(r){
 const d=data();d.strokes=d.strokes||[];d.circled=d.circled||[];
 stageInner.innerHTML=`<div class="circle-board">${r.items.map(([id,e,x,y])=>`<div class="circle-item ${d.circled.includes(id)?'done':''}" data-id="${id}" style="left:${x}%;top:${y}%">${e}</div>`).join('')}</div>`;
 canvas.style.display='block';canvas.style.pointerEvents=viewRole()==='parent'?'none':'auto';drawAll(d.strokes);
}
function pointInPoly(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];const hit=((a.y>p.y)!=(b.y>p.y))&&(p.x<(b.x-a.x)*(p.y-a.y)/((b.y-a.y)||1e-9)+a.x);if(hit)inside=!inside}return inside}

function renderTrace(r){const d=data();d.strokes=d.strokes||[];stageInner.innerHTML=`<div class="trace-board"><svg class="road-svg" viewBox="0 0 850 430" preserveAspectRatio="none"><path class="road-wide" d="${r.path}"/><path class="road-dash" d="${r.path}"/></svg><div class="trace-start">${r.start}</div><div class="trace-end">${r.end}</div></div>`;canvas.style.display='block';canvas.style.pointerEvents=viewRole()==='parent'?'none':'auto';resizeCanvas();drawAll(d.strokes);}
function resizeCanvas(){const rect=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#4c8a6c'}
function drawAll(strokes){resizeCanvas();ctx.clearRect(0,0,stage.clientWidth,stage.clientHeight);(strokes||[]).forEach(drawStroke)}
function drawStroke(st){if(!st||st.length<2)return;ctx.beginPath();ctx.moveTo(st[0].x*stage.clientWidth,st[0].y*stage.clientHeight);for(let i=1;i<st.length;i++)ctx.lineTo(st[i].x*stage.clientWidth,st[i].y*stage.clientHeight);ctx.stroke()}
function pointFromEvent(e){const r=stage.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
function compressStroke(st,maxPoints=70){if(!st||st.length<=maxPoints)return st?st.slice():[];const step=(st.length-1)/(maxPoints-1),out=[];for(let i=0;i<maxPoints;i++)out.push(st[Math.min(st.length-1,Math.round(i*step))]);return out}
canvas.addEventListener('pointerdown',e=>{const type=currentRound()?.type;if((type!=='trace'&&type!=='circle')||viewRole()==='parent')return;e.preventDefault();drawActive=true;canvas.setPointerCapture?.(e.pointerId);currentStroke=[pointFromEvent(e)];data().strokes=data().strokes||[];data().strokes.push(currentStroke);drawAll(data().strokes)});
canvas.addEventListener('pointermove',e=>{if(!drawActive)return;e.preventDefault();currentStroke.push(pointFromEvent(e));drawAll(data().strokes)});
function endStroke(){if(!drawActive)return;drawActive=false;if(currentStroke&&currentStroke.length){const type=currentRound()?.type,d=data(),compact=compressStroke(currentStroke);d.strokes[d.strokes.length-1]=compact;d.strokes=d.strokes.slice(-3);send({type:'strokeComplete',mode:type,points:compact,key:key()});if(type==='trace'){const a=compact[0],b=compact[compact.length-1];if(Math.hypot(a.x-.12,a.y-.76)<.18&&Math.hypot(b.x-.87,b.y-.23)<.20){state.done=true;showFeedback('👍 Молодец!','good')}else{state.done=false;showFeedback('👎 Попробуй ещё','try')}}else if(type==='circle'){const r=currentRound(),a=compact[0],z=compact[compact.length-1],closed=Math.hypot(a.x-z.x,a.y-z.y)<.22,minx=Math.min(...compact.map(p=>p.x)),maxx=Math.max(...compact.map(p=>p.x)),miny=Math.min(...compact.map(p=>p.y)),maxy=Math.max(...compact.map(p=>p.y));let hit=null;if(closed&&(maxx-minx)>.08&&(maxy-miny)>.10){for(const [id,_e,x,y] of r.items){const p={x:x/100,y:y/100};if(pointInPoly(p,compact)||(p.x>minx&&p.x<maxx&&p.y>miny&&p.y<maxy)){hit=id;break}}}d.circled=d.circled||[];if(hit&&r.targets.includes(hit)){if(!d.circled.includes(hit))d.circled.push(hit);state.done=r.targets.every(q=>d.circled.includes(q));showFeedback('👍 Обведено!','good')}else if(hit){state.done=false;showFeedback('👎 Нужны две одинаковые картинки','try')}else{state.done=false;showFeedback('Замкни круг вокруг картинки','try')}}touchState();render()}currentStroke=null}
canvas.addEventListener('pointerup',endStroke);canvas.addEventListener('pointercancel',endStroke);
function receiveStrokeComplete(m){if(m.key!==key()||!Array.isArray(m.points))return;const type=currentRound()?.type;if(type!=='trace'&&type!=='circle')return;const d=data();d.strokes=d.strokes||[];d.strokes.push(m.points);d.strokes=d.strokes.slice(-3);drawAll(d.strokes)}
function clearTrace(){const type=currentRound()?.type;if(type!=='trace'&&type!=='circle')return;data().strokes=[];if(type==='circle')data().circled=[];state.done=false;touchState();render()}
$('#clearBtn').onclick=clearTrace;$('#childClear').onclick=clearTrace;

function renderCollect(r){const d=data();d.found=d.found||[];const total=r.targets.length,emo=r.counterEmoji||'✓';stageInner.innerHTML=`<div class="collect-board"><div class="counter-pill">${emo} ${d.found.length}/${total}</div>${r.items.map(([id,e,x,y])=>`<button class="collect-item ${d.found.includes(id)?'found':''}" data-id="${id}" style="left:${x}%;top:${y}%">${e}</button>`).join('')}</div>`;$$('.collect-item').forEach(btn=>{btn.disabled=viewRole()==='parent'||btn.classList.contains('found');if(viewRole()!=='parent')btn.onclick=()=>{sendPointerFrom(btn);const id=btn.dataset.id;if(r.targets.includes(id)){if(!d.found.includes(id))d.found.push(id);showFeedback('👍 Молодец!','good');if(r.targets.every(x=>d.found.includes(x)))state.done=true;touchState();render()}else showFeedback('👎 '+(r.wrongText||'Попробуй ещё'),'try')}})}

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
   btn.disabled=viewRole()==='parent'||btn.classList.contains('matched');
   if(viewRole()!=='parent')btn.onclick=()=>{
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

function advance(){if(state.finished)return;const b=blocks[state.block];if(state.round<b.rounds.length-1)state.round++;else if(state.block<blocks.length-1){state.block++;state.round=0}else{finishLesson();return}state.done=!!(state.roundData[key()]?.completed);state.updatedAt=Date.now();sendState(true);render()}
function back(){if(state.round>0)state.round--;else if(state.block>0){state.block--;state.round=blocks[state.block].rounds.length-1}else return;state.done=!!(state.roundData[key()]?.completed);state.updatedAt=Date.now();sendState(true);render()}
function updateNextControls(){
 const next=$('#skipBtn'),force=$('#forceNextBtn');
 if(!next||!force)return;
 const b=blocks[state.block];
 const last=!!b && state.block===blocks.length-1 && state.round===b.rounds.length-1;
 next.textContent=last?'Завершить урок 🎉':'Дальше →';
 next.disabled=!state.done;
 force.style.display=state.done?'none':'inline-block';
 const r=currentRound(),d=data(),locked=!!(r?.type==='choice'&&d.locked),canHide=!!(r?.type==='missing'&&(d.phase||'look')==='look');
 if(retryChoiceBtn)retryChoiceBtn.style.display=(viewRole()==='parent'&&locked)?'inline-block':'none';
 if(hideMissingBtn)hideMissingBtn.style.display=(viewRole()==='parent'&&canHide)?'inline-block':'none';
}
function resetChoiceAttempts(notify=true){
 if(currentRound()?.type!=='choice')return;
 const d=data();
 d.wrong=[];d.strikes=0;d.errors=0;d.locked=false;d.selected=null;
 state.done=false;state.updatedAt=Date.now();choiceLock=false;
 if(role==='parent'&&notify){
   choiceUnlockGuardKey=key();choiceUnlockGuardUntil=Date.now()+2200;
   send({type:'choiceUnlock',key:key()});sendState(true)
 }
 render()
}
if(retryChoiceBtn)retryChoiceBtn.onclick=()=>resetChoiceAttempts(true);
if(hideMissingBtn)hideMissingBtn.onclick=()=>{const r=currentRound(),d=data();if(viewRole()!=='parent'||r?.type!=='missing'||(d.phase||'look')!=='look')return;d.phase='quiz';d.wrong=[];state.done=false;state.updatedAt=Date.now();sendState(true);render()};
continueRound.onclick=()=>{if(!state.done)return;data().completed=true;advance()};
$('#skipBtn').onclick=()=>{if(!state.done)return;data().completed=true;advance()};
$('#forceNextBtn').onclick=()=>{data().completed=false;advance()};
$('#prevBtn').onclick=back;
$('#praiseBtn').onclick=()=>{showFeedback('👍 Молодец!','good');send({type:'praise'})};

function finishLesson(){state.finished=true;state.updatedAt=Date.now();sendState(true);showFinish()}
function showFinish(){
 $('#taskCard').classList.add('hidden');controls.style.display='none';childTools.style.display='none';
 const f=$('#finishCard');f.classList.add('active');
 const opts=lessons[lessonId]?.stickers||['⭐','🚀','🦖'];
 $('#stickerGrid').innerHTML=opts.map(s=>`<button class="sticker" data-sticker="${s}">${s}</button>`).join('');
 $('#rewardResult').innerHTML='';$('#finishExit').style.display='none';
 updateAlbum();
 $$('.sticker').forEach(b=>{b.onclick=()=>chooseSticker(b.dataset.sticker,b)});
}
function getAlbum(){try{const a=JSON.parse(localStorage.getItem('kidsLessonAlbum')||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function updateAlbum(){const a=getAlbum();const icons=a.map(x=>typeof x==='string'?x:x?.sticker).filter(Boolean);$('#albumList').textContent=icons.length?icons.join(' '):'Пока пусто'}
function chooseSticker(s,btn){
 $$('.sticker').forEach(x=>x.classList.remove('chosen'));btn.classList.add('chosen');
 let a=getAlbum();
 const already=a.some(x=>typeof x==='object'&&String(x.lessonId)===String(lessonId));
 if(!already)a.push({lessonId:String(lessonId),sticker:s});
 try{localStorage.setItem('kidsLessonAlbum',JSON.stringify(a))}catch{}
 $('#rewardResult').innerHTML=`<div class="reward-big">${s}</div><strong>Наклейка добавлена!</strong>`;
 $('#finishExit').style.display='inline-block';updateAlbum();send({type:'reward',lessonId,sticker:s});
}

window.addEventListener('resize',()=>{if((currentRound()?.type==='trace'||currentRound()?.type==='circle')&&!state.finished)drawAll(data().strokes||[])});
const qs=new URLSearchParams(location.search);if(qs.get('child')==='1'&&qs.get('room'))startChild(qs.get('room'));
})();
