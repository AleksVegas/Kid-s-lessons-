window.lesson4Blocks=[
 {name:'Знакомство с фермой',icon:'🌾',rounds:[
  {type:'learn',title:'Знакомимся с коровой',subtitle:'Сначала наблюдаем и думаем — потом проверяем.',name:'Корова',first:'К',color:'#7A563A',fallback:'🐄',photo:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Seitenansicht_Milchkuh_mit_prallem_Euter.JPG',ask:['Что ты замечаешь у коровы?','Как думаешь, для чего ей нужно вымя?'],hint:'Подумай, чем корова кормит телёнка.',fact:'Корова кормит телёнка молоком. Молоко собирается в вымени. Корова ест траву и сено.'},
  {type:'choice',title:'У кого есть вымя?',subtitle:'Вспомни фото и выбери животное.',correct:'cow',items:[['hen','🐔','Курица'],['cow','🐄','Корова'],['horse','🐴','Лошадь'],['pig','🐷','Свинья']]},
  {type:'learn',title:'Знакомимся с курицей',subtitle:'Рассматриваем настоящую фотографию.',name:'Курица',first:'К',color:'#C34A35',fallback:'🐔',photo:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hen_chicken.jpg',ask:['Что покрывает тело курицы?','Как думаешь, зачем ей нужен клюв?'],hint:'Посмотри на голову и вспомни, как птицы берут корм.',fact:'Курица — птица. У неё есть перья, клюв и крылья. Клювом она клюёт зёрна, а курицы несут яйца.'},
  {type:'choice',title:'Кто несёт яйца?',subtitle:'Выбери животное, которое несёт яйца.',correct:'hen',items:[['horse','🐴','Лошадь'],['pig','🐷','Свинья'],['hen','🐔','Курица'],['cow','🐄','Корова']]},
  {type:'choice',title:'Сколько цыплят?',subtitle:'Посчитай и выбери цифру.',visual:['🐥','🐥','🐥','🐥'],visualType:'count',correct:'4',items:[['2','2️⃣',''],['3','3️⃣',''],['4','4️⃣',''],['5','5️⃣','']]}
 ]},
 {name:'Животные и корм',icon:'🐴',rounds:[
  {type:'learn',title:'Знакомимся с лошадью',subtitle:'Смотрим на фото и рассуждаем вместе.',name:'Лошадь',first:'Л',color:'#8A5B37',fallback:'🐴',photo:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cheval_lusitanien.JPG',ask:['Что ты замечаешь у лошади?','Как думаешь, зачем ей такие сильные ноги?'],hint:'Подумай, как лошадь передвигается.',fact:'Лошадь может быстро бегать. Сильные ноги помогают ей двигаться и нести нагрузку. Лошадь ест траву и сено.'},
  {type:'sort2',title:'Птица или не птица?',subtitle:'Разложи животных по двум группам.',items:[['hen','🐔','bird'],['cow','🐄','other'],['duck','🦆','bird'],['horse','🐴','other'],['goose','🪿','bird'],['pig','🐷','other']],zones:[['bird','🐦','Птица'],['other','🐾','Не птица']]},
  {type:'sort2',title:'Корм или не корм?',subtitle:'Разложи предметы по двум группам.',items:[['grain','🌾','food'],['ball','⚽','no'],['carrot','🥕','food'],['shoe','👟','no'],['apple','🍎','food'],['car','🚗','no']],zones:[['food','🧺','Корм'],['no','🚫','Не корм']]},
  {type:'collect',title:'Найди все яйца',subtitle:'Нажми на все 3 яйца.',targets:['e1','e2','e3'],counterEmoji:'🥚',wrongText:'Это не яйцо',items:[['e1','🥚',14,28],['cow','🐄',38,20],['e2','🥚',62,28],['boot','👢',85,22],['corn','🌽',26,72],['e3','🥚',50,68],['pig','🐷',72,72],['tractor','🚜',90,66]]}
 ]},
 {name:'Память и пары',icon:'🧠',rounds:[
  {type:'memory',title:'Найди 3 пары',subtitle:'Открывай по две карточки и находи одинаковых.',cards:['🐄','🐔','🐴','🐄','🐔','🐴']},
  {type:'match',title:'Кто что даёт?',subtitle:'Собери 3 понятные пары.',pairs:[['cow','🐄','milk','🥛'],['hen','🐔','egg','🥚'],['sheep','🐑','wool','<span class="white-yarn" aria-label="белый клубок шерсти">🧶</span>']]},
  {type:'choice',title:'Кто здесь лишний?',subtitle:'Три картинки — животные. Одна лишняя.',correct:'tractor',items:[['pig','🐷',''],['tractor','🚜',''],['cow','🐄',''],['horse','🐴','']]}
 ]},
 {name:'Фермерская логика',icon:'🧩',rounds:[
  {type:'order',title:'Как растёт кукуруза?',subtitle:'Сначала зернышко, потом росток, потом кукуруза.',answer:['grain','sprout','corn'],items:[['corn','🌽'],['grain','<span class="corn-kernel" aria-label="зерно кукурузы"><svg viewBox="0 0 90 90" aria-hidden="true"><path d="M26 17 C38 8 58 10 67 22 C74 31 73 48 65 61 C58 73 47 80 36 76 C24 72 18 59 19 44 C20 32 20 23 26 17Z"/><path class="kernel-hi" d="M31 22 C40 16 54 17 60 25 C64 31 64 39 61 45 C54 37 43 34 27 36 C27 30 27 25 31 22Z"/></svg></span>'],['sprout','🌱']]},
  {type:'choice',title:'Что будет дальше?',subtitle:'Посмотри на ряд и выбери продолжение.',visual:['🐔','🌾','🐔','🌾','❓'],visualType:'sequence',correct:'hen',items:[['cow','🐄',''],['grain','🌾',''],['hen','🐔',''],['egg','🥚','']]},
  {type:'circle',title:'Обведи одинаковых',subtitle:'Обведи пальцем или мышкой двух одинаковых барашков.',targets:['a','c'],items:[['a','🐑',18,34],['b','🐷',42,27],['c','🐑',67,38],['d','🐄',84,68],['e','🐴',32,73]]}
 ]},
 {name:'Финальная миссия',icon:'🏆',rounds:[
  {type:'collect',title:'Собери урожай',subtitle:'Найди все 4 овоща и фрукта.',targets:['f1','f2','f3','f4'],counterEmoji:'🧺',wrongText:'Это не урожай',items:[['f1','🥕',13,23],['shoe','👟',34,19],['f2','🌽',57,29],['ball','⚽',82,20],['f3','🍅',23,71],['book','📘',45,72],['f4','🍎',69,66],['tractor','🚜',89,72]]},
  {type:'trace',title:'Довези трактор к ферме',subtitle:'Проведи линию по широкой дорожке.',start:'🚜',end:'🏠',path:'M95 360 C175 315 190 220 305 250 S430 340 505 235 S660 135 760 110'},
  {type:'sort2',title:'Живое или неживое?',subtitle:'Разложи картинки по двум группам.',items:[['cow','🐄','alive'],['tractor','🚜','thing'],['hen','🐔','alive'],['bucket','🪣','thing'],['horse','🐴','alive'],['boot','👢','thing']],zones:[['alive','❤️','Живое'],['thing','📦','Неживое']]},
  {type:'memory',title:'Последняя проверка памяти',subtitle:'Найди 3 пары — и урок закончен.',cards:['🐷','🐑','🦆','🐑','🦆','🐷']}
 ]}
];

/*
Photo sources used in this prototype:
- Cow: Wikimedia Commons, File: Seitenansicht Milchkuh mit prallem Euter.JPG.
- Hen: Wikimedia Commons, File: Hen chicken.jpg.
- Horse: Wikimedia Commons, File: Cheval lusitanien.JPG.
Keep applicable attribution/license information if these photos remain in a public release.
*/
