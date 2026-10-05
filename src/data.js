export const SOURCE = {
  repo: 'MetalSage/space-stories-cm14',
  commit: 'a85baeafd79b5c07fd64aad1196a6258dd8b6e25',
  shortCommit: 'a85baeaf',
  checkedAt: '2026-10-05',
};

export const CASINGS = {
  m20: {
    name: 'Мина M20 «Клеймор»', short: 'M20', volume: 120,
    powerCap: 100, baseFalloff: 80, minFalloff: 25, shardCap: 10,
    fire: { i: [3,20], r: [2,4], d: [3,18] },
    trigger: 'mine', allowStarShape: true,
    note: 'Обычная M20 имеет круговой шрапнельный выброс. При сборке с двумя воспламенителями корпус переключает осколки в конус 120°.'
  },
  m40: {
    name: 'Граната M40', short: 'M40', volume: 120,
    powerCap: 180, baseFalloff: 80, minFalloff: 25, shardCap: 10,
    fire: { i: [3,25], r: [1,5], d: [3,24] },
    trigger: 'timer', allowStarShape: true,
  },
  m15: {
    name: 'Граната M15', short: 'M15', volume: 180,
    powerCap: 220, baseFalloff: 120, minFalloff: 25, shardCap: 20,
    fire: { i: [3,30], r: [1,6], d: [3,32] },
    trigger: 'timer', allowStarShape: true,
    note: 'После активации штатный таймер M15 срабатывает через 4 секунды.'
  },
  c4: {
    name: 'Пластиковая взрывчатка C4', short: 'C4', volume: 180,
    powerCap: 280, baseFalloff: 120, minFalloff: 25, shardCap: 25,
    fire: { i: [4,50], r: [2,4], d: [5,20] },
    trigger: 'plastic', allowStarShape: true,
    note: 'При Fire Intensity > 30 огонь создаётся линиями/звездой, а не обычным ромбом.'
  },
  rocket: {
    name: 'Боеголовка ракеты 84 мм', short: '84 мм', volume: 180,
    powerCap: 220, baseFalloff: 160, minFalloff: 25, shardCap: 20,
    fire: { i: [4,45], r: [2,4], d: [5,36] },
    trigger: 'dual', allowStarShape: false,
    note: 'Боеголовке нужны два воспламенителя. Для ракетной трубы отдельно требуется 60 ед. метана.'
  },
  mortar: {
    name: 'Боеголовка миномётной мины 80 мм', short: '80 мм', volume: 240,
    powerCap: 360, baseFalloff: 130, minFalloff: 25, shardCap: 50,
    fire: { i: [5,45], r: [3,8], d: [5,48] },
    trigger: 'dual', allowStarShape: true,
    note: 'Боеголовке нужны два воспламенителя. Для корпуса миномётной мины отдельно требуется 60 ед. водорода.'
  },
  camera: {
    name: 'Камерная боеголовка 80 мм', short: '80 мм Camera', volume: 180,
    powerCap: 360, baseFalloff: 130, minFalloff: 25, shardCap: 50,
    fire: { i: [5,45], r: [3,8], d: [5,48] },
    trigger: 'dual', allowStarShape: true,
    note: 'Камерная версия вмещает 180 ед. вместо 240. Для корпуса миномёта отдельно требуется 60 ед. водорода.'
  }
};

// p/f/i/r/d повторяют вклад реагента в OrdnanceExplosionSystem после его chemistry-effects.
export const CHEMS = {
  anfo:{name:'АНФО',proto:'RMCANFO',group:'Взрывчатые вещества',p:1,f:-.6,i:0,r:0,d:0,recipe:'anfo'},
  cyclonite:{name:'Циклонит',proto:'RMCCyclonite',group:'Взрывчатые вещества',p:1.5,f:-.4,i:0,r:0,d:0,recipe:'cyclonite'},
  octogen:{name:'Октоген',proto:'RMCOctogen',group:'Взрывчатые вещества',p:2,f:-.2,i:.4,r:-.02,d:-.2,recipe:'octogen'},
  nitroglycerin:{name:'Нитроглицерин',proto:'RMCNitroglycerin',group:'Взрывчатые вещества',p:1,f:-.5,i:0,r:0,d:0,recipe:'nitroglycerin'},
  ammonium_nitrate:{name:'Аммиачная селитра',proto:'RMCAmmoniumNitrate',group:'Взрывчатые вещества',p:.4,f:1.5,i:.5,r:0,d:-.2,recipe:'ammonium_nitrate'},
  potassium_hydroxide:{name:'Гидроксид калия',proto:'RMCPotassiumHydroxide',group:'Взрывчатые вещества',p:.5,f:0,i:0,r:0,d:0,recipe:'potassium_hydroxide',available:false,unavailableReason:'Обычная реакция имеет threshold 0 — любой ненулевой замес взрывается.'},

  welding_fuel:{name:'Сварочное топливо',proto:'RMCWeldingFuel',group:'Огненные / модификаторы',p:.12,f:-.1,i:.1,r:-.08,d:.7,stock:true},
  phosphorus:{name:'Фосфор',proto:'RMCPhosphorus',group:'Огненные / модификаторы',p:0,f:0,i:1,r:-.12,d:.1},
  ethanol:{name:'Этанол',proto:'RMCEthanol',group:'Огненные / модификаторы',p:0,f:0,i:.2,r:.1,d:.2},
  carbon:{name:'Углерод',proto:'RMCCarbon',group:'Огненные / модификаторы',p:0,f:0,i:0,r:0,d:1},
  hydrogen:{name:'Водород',proto:'RMCHydrogen',group:'Огненные / модификаторы',p:.15,f:0,i:-.5,r:.2,d:-.5,stock:true},
  oxygen:{name:'Кислород',proto:'RMCOxygen',group:'Огненные / модификаторы',p:0,f:0,i:1.15,r:-.10,d:-.2,stock:true},
  methane:{name:'Метан',proto:'RMCMethane',group:'Огненные / модификаторы',p:.15,f:0,i:-.35,r:.095,d:.25,recipe:'methane',stock:true},
  phoron:{name:'Форон',proto:'RMCPhoron',group:'Огненные / модификаторы',p:0,f:0,i:.4,r:.05,d:-.8},
  water:{name:'Вода',proto:'Water',group:'Огненные / модификаторы',p:0,f:0,i:-3,r:0,d:0,stock:true},
  hexamine:{name:'Гексамин',proto:'RMCHexamine',group:'Огненные / модификаторы',p:0,f:0,i:0,r:0,d:.5,recipe:'hexamine'},
  lithium:{name:'Литий',proto:'RMCLithium',group:'Огненные / модификаторы',p:0,f:0,i:.35,r:-.01,d:-.1},
  table_salt:{name:'Столовая соль',proto:'RMCTableSalt',group:'Огненные / модификаторы',p:0,f:0,i:.1,r:0,d:0},
  napalm:{name:'Напалм',proto:'RMCNapalm',group:'Огненные / модификаторы',p:0,f:0,i:.45,r:.06,d:.75,recipe:'napalm'},
  napalm_sticky:{name:'Липкий напалм',proto:'RMCNapalmSticky',group:'Огненные / модификаторы',p:0,f:0,i:-1.05,r:-.44,d:-4.25,recipe:'napalm_sticky'},
  napalm_hc:{name:'Высокогорючий напалм',proto:'RMCNapalmHighCombustion',group:'Огненные / модификаторы',p:0,f:0,i:-4.05,r:-.44,d:-.25,recipe:'napalm_hc'},
  clf3:{name:'Трифторид хлора',proto:'RMCCLF3',group:'Огненные / модификаторы',p:0,f:0,i:1.8,r:-.09,d:-.9,recipe:'clf3'},
  iron:{name:'Железо',proto:'RMCIron',group:'Огненные / модификаторы',p:0,f:0,i:0,r:0,d:0,shrapnel:true},
  potassium_chlorophoride:{name:'Хлорофорид калия',proto:'RMCPotassiumChlorophoride',group:'Огненные / модификаторы',p:0,f:0,i:0,r:0,d:0},

  ammonia:{name:'Аммиак',proto:'RMCAmmonia',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,recipe:'ammonia',stock:true},
  polytrinic:{name:'Политриновая кислота',proto:'RMCPolytrinicAcid',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,recipe:'polytrinic',stock:true},
  formaldehyde:{name:'Формальдегид',proto:'RMCFormaldehyde',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,recipe:'formaldehyde'},
  paraformaldehyde:{name:'Параформальдегид',proto:'RMCParaformaldehyde',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,recipe:'paraformaldehyde',sourceKind:'machine'},
  glycerol:{name:'Глицерин',proto:'RMCGlycerol',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,recipe:'glycerol'},
  corn_oil:{name:'Кукурузное масло RMC',proto:'RMCCornOil',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,sourceKind:'external',source:'RMCCondimentCornOil (50 ед.)'},
  sulfuric_acid:{name:'Серная кислота RMC',proto:'RMCSulphuricAcid',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0,stock:true},
  chlorine:{name:'Хлор',proto:'RMCChlorine',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0},
  fluorine:{name:'Фтор',proto:'RMCFluorine',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0},
  potassium:{name:'Калий',proto:'RMCPotassium',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0},
  nitrogen:{name:'Азот',proto:'RMCNitrogen',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0},
  aluminium:{name:'Алюминий',proto:'RMCAluminum',group:'Прекурсоры',p:0,f:0,i:0,r:0,d:0},

  // Оставлены только как справочная информация, в конструктор не попадают.
  frost_oil:{name:'RMC морозное масло',proto:'RMCFrostOil',group:'Недоступные / спорные',p:0,f:0,i:0,r:0,d:0,available:false,unavailableReason:'Рабочий путь OT использует промышленную морозилку; штатный источник RMCFrostOil не найден.'},
  napalm_ut:{name:'Топливо СГ-Нафталин',proto:'RMCNapalmUT',group:'Недоступные / спорные',p:0,f:0,i:.45,r:.06,d:.75,available:false,unavailableReason:'Не подтверждён надёжный способ получить как свободный реагент в мензурке.'},
  bgel:{name:'Напалм Б-Гель',proto:'RMCBGel',group:'Недоступные / спорные',p:0,f:0,i:.45,r:.06,d:.75,available:false,unavailableReason:'Найден в закрытом flamer tank, не как свободная химия.'},
  napalm_b:{name:'Напалм Б',proto:'RMCNapalmB',group:'Недоступные / спорные',p:0,f:0,i:.45,r:.06,d:.75,available:false,unavailableReason:'Найден в закрытом flamer tank.'},
  napalm_x:{name:'Напалм X',proto:'RMCNapalmX',group:'Недоступные / спорные',p:0,f:0,i:.45,r:.06,d:.75,available:false,unavailableReason:'Найден в закрытом flamer tank.'},
};

export const STOCKED = new Set(['oxygen','sulfuric_acid','water','polytrinic','ammonia','methane','hydrogen','welding_fuel']);

export const RECIPES = {
  potassium_hydroxide:{inputs:{water:1,potassium:1},quantum:1,batch:1,danger:true,note:'Не готовить обычным смешиванием: threshold 0.'},
  methane:{inputs:{hydrogen:4,carbon:1},quantum:1,batch:60,order:['hydrogen','carbon'],note:'4 водорода + 1 углерода → 1 метана.'},
  ammonia:{inputs:{hydrogen:1,nitrogen:1/3},quantum:3,batch:225,order:['hydrogen','nitrogen'],note:'3 водорода + 1 азота → 3 аммиака.'},
  polytrinic:{inputs:{sulfuric_acid:1/3,chlorine:1/3,potassium:1/3},quantum:3,batch:300,order:['sulfuric_acid','chlorine','potassium'],note:'1 серной + 1 хлора + 1 калия → 3 политриновой.'},
  ammonium_nitrate:{inputs:{ammonia:.5,polytrinic:.5},quantum:2,batch:300,order:['ammonia','polytrinic'],note:'1 аммиака + 1 политриновой → 2 аммиачной селитры.'},
  anfo:{inputs:{ammonium_nitrate:1,welding_fuel:.5},quantum:2,batch:120,order:['ammonium_nitrate','welding_fuel'],sensitive:true,note:'2 селитры + 1 топлива → 2 АНФО. Безопасный максимум одной реакции: 120 готового АНФО.'},
  glycerol:{inputs:{corn_oil:3,sulfuric_acid:1},quantum:1,batch:75,order:['corn_oil','sulfuric_acid'],note:'3 RMCCornOil + 1 RMCSulphuricAcid → 1 глицерина.'},
  nitroglycerin:{inputs:{glycerol:.5,polytrinic:.5,sulfuric_acid:.5},quantum:2,batch:10,order:['glycerol','polytrinic','sulfuric_acid'],sensitive:true,note:'Безопасный максимум одной реакции: 10 готового нитроглицерина.'},
  formaldehyde:{inputs:{methane:1/3,phoron:1/3,oxygen:1/3},quantum:3,batch:240,vessel:'silver',order:['methane','phoron','oxygen'],note:'Нужна большая серебряная мензурка: она сама является серебряным катализатором.'},
  hexamine:{inputs:{ammonia:2/3,formaldehyde:1},quantum:3,batch:180,order:['formaldehyde','ammonia'],note:'3 формальдегида + 2 аммиака → 3 гексамина.'},
  paraformaldehyde:{inputs:{formaldehyde:1,water:1},quantum:3,batch:60,machine:'freezer',order:['formaldehyde','water'],note:'В промышленной морозилке OT: каждые 20 секунд 3 формальдегида + 3 воды → 3 параформальдегида; до 3 ёмкостей параллельно.'},
  cyclonite:{inputs:{hexamine:1,polytrinic:1},quantum:1,batch:150,order:['hexamine','polytrinic'],note:'1 гексамина + 1 политриновой → 1 циклонита.'},
  octogen:{inputs:{paraformaldehyde:.5,ammonium_nitrate:.5,hexamine:.5,polytrinic:.5},quantum:2,batch:150,special:'octogen',order:['paraformaldehyde','ammonium_nitrate','polytrinic','hexamine'],note:'На 2 октогена — по 1 каждого прекурсора. Гексамин практично лить последним.'},
  napalm:{inputs:{water:1,phoron:1,aluminium:1,sulfuric_acid:1},quantum:1,batch:75,order:['water','phoron','aluminium','sulfuric_acid'],byproducts:{hydrogen:2,oxygen:1},note:'Вода первой. Без воды сочетание форона + алюминия + серной кислоты запускает bad-реакцию.'},
  clf3:{inputs:{water:1,chlorine:1/3,fluorine:1},quantum:3,batch:75,order:['water','chlorine','fluorine'],byproducts:{hydrogen:2,oxygen:1},note:'Вода первой. Без воды хлор + фтор запускают bad-реакцию.'},
  napalm_sticky:{inputs:{napalm:.5,welding_fuel:.5},quantum:2,batch:300,order:['napalm','welding_fuel'],note:'1 напалма + 1 сварочного топлива → 2 липкого напалма.'},
  napalm_hc:{inputs:{napalm:.5,clf3:.5},quantum:2,batch:300,order:['napalm','clf3'],note:'1 напалма + 1 ClF3 → 2 высокогорючего напалма.'},
};

export const SENSITIVE = {
  anfo:{name:'АНФО',safeProduct:120,rule:'Аммиачная селитра + сварочное топливо'},
  nitroglycerin:{name:'Нитроглицерин',safeProduct:10,rule:'Глицерин + политриновая + серная'},
  potassium_hydroxide:{name:'Гидроксид калия',safeProduct:0,rule:'Вода + калий'},
};

export const PRESETS = [
  {id:'m15_max',casing:'m15',name:'Максимальный фугас',badge:'Просто',kind:'blast',difficulty:'easy',goal:'Универсальный сильный взрыв',recommended:true,desc:'120 АНФО + 60 циклонита. Быстро и надёжно.',mix:{anfo:120,cyclonite:60}},
  {id:'m15_t3_chaser',casing:'m15',name:'T3 Chaser',badge:'Anti-T3',kind:'anti',difficulty:'medium',goal:'Сильно ранить отходящего T3',recommended:true,desc:'Большой полезный open-grid охват, если цель успела отойти.',mix:{anfo:148,octogen:32}},
  {id:'m15_t3_close',casing:'m15',name:'T3 Close',badge:'Anti-T3',kind:'anti',difficulty:'medium',goal:'T3 в 0–2 тайлах',desc:'Power-cap M15 и хороший ближний blast.',mix:{anfo:140,octogen:40}},
  {id:'m15_t3_breaker',casing:'m15',name:'T3 Breaker',badge:'Контакт',kind:'frag',difficulty:'hard',goal:'Контакт / узкий проход',desc:'108 октогена + 72 железа. Blast почти контактный; смысл — 18 AP-осколков.',mix:{octogen:108,iron:72}},
  {id:'m15_t3_basic',casing:'m15',name:'T3 Basic',badge:'Проще',kind:'anti',difficulty:'easy',goal:'Anti-T3 без октогена',desc:'115 АНФО + 65 циклонита.',mix:{anfo:115,cyclonite:65}},
  {id:'m15_firewall',casing:'m15',name:'Xeno Firewall',badge:'Огонь',kind:'fire',difficulty:'easy',goal:'Закрыть проход большой зоной огня',recommended:true,desc:'Доступная химия; фактический огонь M15 округляется вниз до целых значений.',mix:{cyclonite:72,ethanol:75,oxygen:12,carbon:18,phosphorus:1,welding_fuel:2}},
  {id:'m15_sun',casing:'m15',name:'«Солнцепёк»',badge:'Огонь',kind:'fire',difficulty:'easy',goal:'Чистая огненная зона',desc:'Почти без blast, зато максимальный пожар.',mix:{phosphorus:10,ethanol:90,welding_fuel:20,carbon:60}},

  {id:'m40_power',casing:'m40',name:'M40 Power',badge:'Просто',kind:'blast',difficulty:'easy',goal:'Максимум Power',recommended:true,desc:'120 циклонита.',mix:{cyclonite:120}},
  {id:'m40_octogen',casing:'m40',name:'M40 Octogen',badge:'Октоген',kind:'blast',difficulty:'medium',goal:'Power-cap с запасом объёма',desc:'90 октогена → cap 180.',mix:{octogen:90}},
  {id:'m40_wide',casing:'m40',name:'M40 Wide',badge:'Радиус',kind:'blast',difficulty:'easy',goal:'Широкая волна',desc:'35 АНФО + 85 циклонита.',mix:{anfo:35,cyclonite:85}},
  {id:'m40_inc',casing:'m40',name:'Зажигательная',badge:'Огонь',kind:'fire',difficulty:'easy',goal:'Пожар',desc:'10 фосфора + 85 этанола + 25 топлива.',mix:{phosphorus:10,ethanol:85,welding_fuel:25}},

  {id:'m20_mafin',casing:'m20',name:'М.А.Ф.И.Н.',badge:'Просто',kind:'blast',difficulty:'easy',goal:'Противопехотная мина',recommended:true,desc:'100 АНФО + 20 фосфора.',mix:{anfo:100,phosphorus:20}},

  {id:'rocket_octogen',casing:'rocket',name:'84 мм Octogen Impact',badge:'Октоген',kind:'blast',difficulty:'medium',goal:'Максимальный удар ракеты',recommended:true,desc:'110 октогена → Power-cap 220.',mix:{octogen:110}},
  {id:'rocket_wide',casing:'rocket',name:'84 мм Wide',badge:'Просто',kind:'blast',difficulty:'easy',goal:'Power-cap без октогена',desc:'100 АНФО + 80 циклонита.',mix:{anfo:100,cyclonite:80}},

  {id:'mortar_octogen',casing:'mortar',name:'80 мм Octogen Max',badge:'Октоген',kind:'blast',difficulty:'medium',goal:'Максимум миномёта',recommended:true,desc:'180 октогена → Power-cap 360.',mix:{octogen:180}},
  {id:'mortar_wide',casing:'mortar',name:'80 мм Wide',badge:'Радиус',kind:'blast',difficulty:'easy',goal:'Огромный широкий взрыв',desc:'45 АНФО + 195 циклонита.',mix:{anfo:45,cyclonite:195}},

  {id:'c4_octogen',casing:'c4',name:'C4 Octogen Max',badge:'Октоген',kind:'blast',difficulty:'medium',goal:'Power-cap C4',recommended:true,desc:'140 октогена → 280 Power.',mix:{octogen:140}},
  {id:'c4_wide',casing:'c4',name:'C4 Wide',badge:'Радиус',kind:'blast',difficulty:'easy',goal:'Широкий заряд',desc:'130 АНФО + 50 циклонита.',mix:{anfo:130,cyclonite:50}},
];

export const XENOS = {
  boiler:{name:'Boiler',hp:750,crit:650,ea:20,xenoArmor:20,weak:true,size:'big',notes:'Базовый T3. Обычный blast-control работает.'},
  sapper:{name:'Boiler — Sapper',hp:690,crit:590,ea:20,xenoArmor:0,weak:true,size:'big'},
  despoiler:{name:'Despoiler',hp:750,crit:650,ea:20,xenoArmor:25,weak:true,size:'big'},
  praet:{name:'Praetorian',hp:750,crit:650,ea:40,xenoArmor:25,weak:true,size:'big'},
  valkyrie:{name:'Praetorian — Valkyrie',hp:750,crit:650,ea:40,xenoArmor:35,weak:true,size:'big'},
  dancer:{name:'Praetorian — Dancer',hp:750,crit:650,ea:40,xenoArmor:20,weak:true,size:'big'},
  vanguard:{name:'Praetorian — Vanguard',hp:690,crit:590,ea:40,xenoArmor:25,weak:true,size:'big',specialShield:'vanguard',notes:'Активный Vanguard Shield добавляет Explosion Resistance 75 и первая значимая атака щита может быть полностью обнулена.'},
  oppressor:{name:'Praetorian — Oppressor',hp:750,crit:650,ea:60,xenoArmor:25,weak:false,size:'big',notes:'weak:false: blast-control появляется только при factor > 10.'},
  ravager:{name:'Ravager',hp:750,crit:650,ea:80,xenoArmor:25,weak:true,size:'big',fireImmune:true,notes:'Иммунен к обычному tile-fire damage.'},
  berserker:{name:'Ravager — Berserker',hp:690,crit:590,ea:80,xenoArmor:30,weak:true,size:'big',fireImmune:true},
  hedgehog:{name:'Ravager — Hedgehog',hp:750,crit:650,ea:100,xenoArmor:25,weak:true,size:'big',fireImmune:true},
  crusher:{name:'Crusher',hp:800,crit:700,ea:100,xenoArmor:30,weak:false,size:'immobile',specialShield:'crusher',notes:'weak:false. Defensive Shield на 2.5 c добавляет Explosion Resistance 1000; почти гасит blast.'},
  charger:{name:'Crusher — Charger',hp:880,crit:780,ea:100,xenoArmor:20,weak:false,size:'immobile',notes:'Наследует высокую Explosion Armor; directional обычная броня не участвует в blast-уроне.'},
};

export const SOURCE_LINKS = [
  ['OrdnanceExplosionSystem.cs','Content.Server/_Stories/Ordnance/Explosion/OrdnanceExplosionSystem.cs'],
  ['ExplosionSystem.TileFill.cs','Content.Server/Explosion/EntitySystems/ExplosionSystem.TileFill.cs'],
  ['ExplosionGridTileFlood.cs','Content.Server/Explosion/EntitySystems/ExplosionGridTileFlood.cs'],
  ['ExplosionSystem.Processing.cs','Content.Server/Explosion/EntitySystems/ExplosionSystem.Processing.cs'],
  ['CMArmorSystem.cs','Content.Shared/_RMC14/Armor/CMArmorSystem.cs'],
  ['SharedRMCExplosionSystem.cs','Content.Shared/_RMC14/Explosion/SharedRMCExplosionSystem.cs'],
  ['ordnancecasings.yml','Resources/Prototypes/_RMC14/Entities/Objects/Misc/ordnancecasings.yml'],
  ['explosives.yml (reagents)','Resources/Prototypes/_Stories/Reagents/explosives.yml'],
  ['explosives.yml (reactions)','Resources/Prototypes/_Stories/Recipes/Reactions/explosives.yml'],
  ['IndustryFreezerSystem.cs','Content.Server/_Stories/Ordnance/Machinery/IndustryFreezerSystem.cs'],
];
