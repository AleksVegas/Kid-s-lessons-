window.lesson5Blocks=[
{name:'Спасатели и машины',icon:'🚒',rounds:[
 {type:'learn',title:'Знакомимся с пожарной машиной',subtitle:'Сначала рассматриваем настоящее фото и думаем.',name:'Пожарная машина',first:'П',color:'#D84436',fallback:'🚒',photo:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Fire_engine_Scania_P114G_front.jpg?width=800',credit:'Фото: <a href="https://commons.wikimedia.org/wiki/File:Fire_engine_Scania_P114G_front.jpg" target="_blank" rel="noopener">Henrik Sendelbach / Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener">CC BY-SA 3.0</a>.',ask:['Что ты замечаешь у этой машины?','Как думаешь, зачем ей мигалки и специальное оборудование?'],hint:'Вспомни, кто приезжает, когда где-то пожар.',fact:'Пожарная машина помогает пожарным быстро приехать к месту пожара. На ней перевозят воду, шланги и другое оборудование.'},
 {type:'choice',title:'Кто едет тушить пожар?',subtitle:'Выбери нужную машину.',correct:'fire',items:[['taxi','🚕','Такси'],['fire','🚒','Пожарная'],['bus','🚌','Автобус'],['bike','🚲','Велосипед']]},
 {type:'learn',title:'Знакомимся с экскаватором',subtitle:'Посмотри на ковш и подумай, зачем он нужен.',name:'Экскаватор',first:'Э',color:'#D89B16',fallback:'🚜',photo:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Excavator_side.jpg?width=800',ask:['Что большое ты видишь спереди?','Как думаешь, что можно делать таким ковшом?'],hint:'Представь, что нужно выкопать большую яму.',fact:'Экскаватор копает и переносит землю. Большой ковш помогает набирать грунт, песок и камни.'},
 {type:'choice',title:'Что копает землю?',subtitle:'Найди машину с большим ковшом.',correct:'exc',items:[['bus','🚌','Автобус'],['exc','🏗️','Экскаватор'],['taxi','🚕','Такси'],['bike','🚲','Велосипед']]},
 {type:'choice',title:'Сколько машин?',subtitle:'Посчитай и выбери цифру.',visual:['🚗','🚗','🚗','🚗'],visualType:'count',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]}
]},
{name:'Дорога и правила',icon:'🚦',rounds:[
 {type:'learn',title:'Знакомимся со светофором',subtitle:'Смотрим на настоящий светофор и рассуждаем.',name:'Светофор',first:'С',color:'#C43B31',fallback:'🚦',photo:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Traffic_light.jpg?width=800',ask:['Что ты видишь на светофоре?','Как думаешь, зачем водителям и пешеходам нужны его сигналы?'],hint:'Вспомни: на один цвет мы стоим, на другой можем двигаться.',fact:'Светофор помогает безопасно двигаться по дороге. Красный означает «стой», а зелёный разрешает движение.'},
 {type:'sort2',title:'Есть колёса или нет?',subtitle:'Разложи картинки по двум группам.',items:[['car','🚗','wheel'],['light','🚦','no'],['bus','🚌','wheel'],['tree','🌳','no'],['bike','🚲','wheel'],['house','🏠','no']],zones:[['wheel','🛞','Есть колёса'],['no','✋','Нет колёс']]},
 {type:'collect',title:'Найди все светофоры',subtitle:'Нажми на все 3 светофора.',targets:['s1','s2','s3'],counterEmoji:'🚦',wrongText:'Это не светофор',items:[['s1','🚦',14,28],['car','🚗',38,20],['s2','🚦',62,28],['bus','🚌',85,22],['tree','🌳',26,72],['s3','🚦',50,68],['bike','🚲',72,72],['house','🏠',90,66]]},
 {type:'match',title:'Кто куда едет?',subtitle:'Собери 3 понятные пары.',pairs:[['amb','🚑','hospital','🏥'],['bus','🚌','stop','🚏'],['plane','✈️','airport','🛫']]}
]},
{name:'Память и внимание',icon:'👀',rounds:[
 {type:'missing',title:'Что исчезло?',subtitle:'Сначала запомни 4 картинки. Потом найди пропавшую.',hidden:'bus',items:[['car','🚗'],['bus','🚌'],['bike','🚲'],['fire','🚒']]},
 {type:'memory',title:'Найди 3 пары',subtitle:'Открывай по две карточки и находи одинаковые.',cards:['🚕','🚦','🚌','🚕','🚦','🚌']},
 {type:'choice',title:'Что здесь лишнее?',subtitle:'Три картинки — транспорт. Одна лишняя.',correct:'tree',items:[['car','🚗',''],['bus','🚌',''],['tree','🌳',''],['bike','🚲','']]}
]},
{name:'Размер и логика',icon:'🧩',rounds:[
 {type:'sizeorder',title:'От маленького к большому',subtitle:'Расставь транспорт по настоящему размеру.',answer:['scooter','car','bus'],items:[['bus','🚌'],['scooter','🛴'],['car','🚗']]},
 {type:'choice',title:'Что будет дальше?',subtitle:'Посмотри на ряд и выбери продолжение.',visual:['🚦','🚗','🚦','🚗','❓'],visualType:'sequence',correct:'light',items:[['bus','🚌',''],['light','🚦',''],['bike','🚲',''],['car','🚗','']]},
 {type:'circle',title:'Обведи одинаковых',subtitle:'Обведи пальцем или мышкой два одинаковых такси.',targets:['a','c'],items:[['a','🚕',18,34],['b','🚗',42,27],['c','🚕',67,38],['d','🚌',84,68],['e','🚒',32,73]]}
]},
{name:'Городская миссия',icon:'🏆',rounds:[
 {type:'collect',title:'Найди городской транспорт',subtitle:'Найди все 4 нужные машины.',targets:['t1','t2','t3','t4'],counterEmoji:'🚗',wrongText:'Это не городской транспорт',items:[['t1','🚕',13,23],['tree','🌳',34,19],['t2','🚌',57,29],['house','🏠',82,20],['t3','🚑',23,71],['ball','⚽',45,72],['t4','🚒',69,66],['dog','🐶',89,72]]},
 {type:'trace',title:'Проведи пожарную машину к пожару',subtitle:'Веди линию по широкой дороге.',start:'🚒',end:'🔥',path:'M95 360 C175 315 190 220 305 250 S430 340 505 235 S660 135 760 110'},
 {type:'sort2',title:'Дорога или вода?',subtitle:'Разложи транспорт по месту движения.',items:[['car','🚗','road'],['boat','⛵','water'],['bus','🚌','road'],['ship','🚢','water'],['bike','🚲','road'],['canoe','🛶','water']],zones:[['road','🛣️','По дороге'],['water','🌊','По воде']]},
 {type:'missing',title:'Финальная проверка памяти',subtitle:'Запомни картинки и найди ту, которая исчезнет.',hidden:'taxi',items:[['taxi','🚕'],['light','🚦'],['bus','🚌'],['fire','🚒']]}
]}
];