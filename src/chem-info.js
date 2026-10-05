import { CHEMS, RECIPES, STOCKED } from './data.js';

export const CHEM_DETAILS = {
  anfo:{
    role:'Широкий blast',
    summary:'Главный реагент для большого полезного охвата взрывом.',
    how:'Каждая 1u даёт +1 Power и уменьшает Falloff на 0.6. Низкий Falloff обычно важнее для попадания по отходящей цели, чем ещё несколько единиц Power.',
    use:'Смешивай с Cyclonite/Octogen, когда нужно сохранить сильный удар на нескольких тайлах.',
    avoid:'Сам по себе упирается в Power медленнее Octogen. При производстве больше 120u готового ANFO дели на партии.',
  },
  cyclonite:{
    role:'Универсальная взрывчатка',
    summary:'Компромисс между Power и шириной blast.',
    how:'1u = +1.5 Power и −0.4 Falloff. Плотнее ANFO по Power, но хуже расширяет волну.',
    use:'Хорош для простых maxcap-составов и как силовая добавка к ANFO.',
    avoid:'Если Power уже упёрся в cap, лишний Cyclonite может почти ничего не дать.',
  },
  octogen:{
    role:'Максимум Power на объём',
    summary:'Самая плотная рабочая взрывчатка OT; ещё слегка усиливает огонь.',
    how:'1u = +2 Power, −0.2 Falloff, примерно +0.4 Fire Intensity, −0.02 Radius и −0.2 Duration.',
    use:'Когда объём ограничен и нужен Power-cap, либо в компактных anti-T3/frag смесях.',
    avoid:'Сложнее производить. Огненный бонус небольшой и одновременно делает пожар короче/чуть уже.',
  },
  nitroglycerin:{
    role:'Взрывчатка',
    summary:'По боевому профилю близок к ANFO, но производить опаснее.',
    how:'1u = +1 Power и −0.5 Falloff.',
    use:'Как альтернативная взрывчатка, если она уже есть готовой.',
    avoid:'Самостоятельно варить большими объёмами неудобно: безопасный продукт одной реакции — 10u.',
  },
  ammonium_nitrate:{
    role:'Прекурсор + слабая пиротехника',
    summary:'В первую очередь нужен для ANFO и Octogen, а не как финальная взрывчатка.',
    how:'1u = +0.4 Power, но +1.5 Falloff (ухудшает blast), +0.5 Fire Intensity и −0.2 Duration.',
    use:'Доводи до ANFO/Octogen, если есть возможность.',
    avoid:'Оставлять большие объёмы в финальном payload обычно невыгодно: Falloff резко растёт.',
  },
  potassium_hydroxide:{
    role:'Опасная взрывчатка',
    summary:'Даёт Power, но штатный рецепт практически непригоден для безопасного производства.',
    how:'1u = +0.5 Power.',
    use:'Только если каким-то внешним способом уже получен готовый реагент.',
    avoid:'Вода + калий запускают sensitive reaction с threshold 0. В приложении скрыт.',
  },
  welding_fuel:{
    role:'Продление огня + немного blast',
    summary:'Очень полезный дешёвый модификатор пожара и компонент ANFO.',
    how:'Итоговый вклад 1u ≈ +0.12 Power, −0.1 Falloff, +0.1 Intensity, −0.08 Radius, +0.7 Duration.',
    use:'Когда огню не хватает Duration и нужен небольшой blast-бонус.',
    avoid:'Слишком много начинает сжимать радиус. С аммиачной селитрой автоматически образует ANFO.',
  },
  phosphorus:{
    role:'Концентратор огня',
    summary:'Очень быстро поднимает Fire Intensity.',
    how:'1u = +1 Intensity, +0.1 Duration, −0.12 Radius.',
    use:'Чтобы дожать Intensity до cap малым объёмом.',
    avoid:'Большие количества съедают радиус. После достижения cap лишний фосфор — почти балласт.',
  },
  ethanol:{
    role:'Расширитель пожара',
    summary:'Один из лучших простых универсальных огненных наполнителей.',
    how:'1u = +0.2 Intensity, +0.2 Duration, +0.1 Radius.',
    use:'Большие огненные зоны: одновременно делает пожар сильнее, шире и дольше.',
    avoid:'Не даёт blast Power. Если все fire-параметры уже в cap, лишний этанол бесполезен кроме цвета.',
  },
  carbon:{
    role:'Длительность + золотой цвет',
    summary:'Продлевает пожар и сильно окрашивает его в золотой.',
    how:'1u = +1 raw Fire Duration. Power/Intensity/Radius не меняет. BurnColor #ffd700 имеет большой вес 3.',
    use:'Когда Duration реально ниже cap или когда нужен золотой цвет.',
    avoid:'Если Duration уже достиг cap корпуса — углерод не усиливает пожар вообще. В старом «Солнцепёке» все 60u практически только красят огонь.',
  },
  hydrogen:{
    role:'Расширитель огня с компромиссом',
    summary:'Немного добавляет blast и расширяет пожар ценой Intensity/Duration.',
    how:'1u = +0.15 Power, −0.5 Intensity, +0.2 Radius, −0.5 Duration.',
    use:'Когда радиус важнее силы и времени огня.',
    avoid:'Легко испортить уже слабый пожар, если Intensity близка к минимуму.',
  },
  oxygen:{
    role:'Сильный усилитель огня',
    summary:'Быстро повышает Intensity, слегка сжимая и укорачивая пожар.',
    how:'С учётом Oxidizing potency 2: 1u ≈ +1.15 Intensity, −0.10 Radius, −0.2 Duration.',
    use:'Для быстрого добора Intensity до cap.',
    avoid:'После cap лишний кислород только отъедает объём и ухудшает Radius/Duration.',
  },
  methane:{
    role:'Слабый blast + растяжка огня',
    summary:'Промежуточный реагент, который немного расширяет пожар.',
    how:'С учётом Flowing/Viscous/Fueling: 1u ≈ +0.15 Power, −0.35 Intensity, +0.095 Radius, +0.25 Duration.',
    use:'Обычно как прекурсор Formaldehyde; напрямую — только для тонкой настройки.',
    avoid:'Слабый по Power и снижает Intensity.',
  },
  phoron:{
    role:'Горячий короткий пожар',
    summary:'Делает огонь сильнее и немного шире, но заметно короче.',
    how:'1u = +0.4 Intensity, +0.05 Radius, −0.8 Duration.',
    use:'Когда Duration уже с запасом, а нужны Intensity/Radius.',
    avoid:'Большие объёмы могут обрушить Duration.',
  },
  water:{
    role:'Тушитель / реакционный ингредиент',
    summary:'В финальном зажигательном payload почти всегда вредна.',
    how:'1u = −3 Fire Intensity.',
    use:'Для Napalm/ClF3/Paraformaldehyde и других производственных шагов.',
    avoid:'Не оставляй лишнюю воду в готовой зажигательной смеси.',
  },
  hexamine:{
    role:'Прекурсор + Duration',
    summary:'Главный прекурсор Cyclonite/Octogen; напрямую немного продлевает пожар.',
    how:'1u = +0.5 Fire Duration.',
    use:'Почти всегда лучше переработать в Cyclonite/Octogen.',
    avoid:'Тратить готовый Hexamine только ради Duration обычно невыгодно.',
  },
  lithium:{
    role:'Мягкий усилитель огня + цвет',
    summary:'Добавляет Intensity почти не трогая Radius и красит огонь в розовый.',
    how:'С учётом Oxidizing potency 1: 1u ≈ +0.35 Intensity, −0.01 Radius, −0.1 Duration.',
    use:'Для тонкой настройки Intensity без сильной потери радиуса.',
    avoid:'По эффективности на объём слабее кислорода/фосфора.',
  },
  table_salt:{
    role:'Цвет + слабая Intensity',
    summary:'Почти косметический жёлтый модификатор.',
    how:'1u = +0.1 Fire Intensity и жёлтый BurnColor.',
    use:'Для цвета или очень тонкой доводки.',
    avoid:'Как боевой модификатор слишком слаб на единицу объёма.',
  },
  napalm:{
    role:'Универсальный fire-модификатор',
    summary:'Хорошо двигает сразу три параметра пожара и сам по себе выбирает RMCTileFireNapalmBase.',
    how:'С учётом Oxidizing/Fueling/Flowing: 1u ≈ +0.45 Intensity, +0.06 Radius, +0.75 Duration. Поля топлива intensity/duration/radius не складываются в custom ordnance напрямую.',
    use:'Если нужен сбалансированный пожар и есть время на производство.',
    avoid:'Если другой реагент создаёт weighted BurnColor, сервер может заменить специальный napalm FireEntity на STTileFireDynamic. «Краска» иногда меняет механику, а не только вид.',
  },
  napalm_sticky:{
    role:'Специальное топливо',
    summary:'В custom ordnance его собственные modifiers сильно уменьшают обычные fire-параметры.',
    how:'Итоговый вклад 1u ≈ −1.05 Intensity, −0.44 Radius, −4.25 Duration.',
    use:'Имеет смысл только ради специальных свойств соответствующего fire entity, если оно реально сохранится.',
    avoid:'Для обычного «сделать пожар больше» крайне плох.',
  },
  napalm_hc:{
    role:'Специальное топливо',
    summary:'Высокогорючий напалм не означает автоматический огромный custom-fire.',
    how:'Итоговый вклад 1u ≈ −4.05 Intensity, −0.44 Radius, −0.25 Duration.',
    use:'Только ради специального fire entity/механики.',
    avoid:'Не оценивай его по полям intensity:45/radius:5 из прототипа топлива — custom ordnance их напрямую не складывает.',
  },
  clf3:{
    role:'Очень сильный окислитель',
    summary:'Резко поднимает Intensity, одновременно сжимая и укорачивая пожар.',
    how:'Oxidizing potency 9: 1u = +1.8 Intensity, −0.09 Radius, −0.9 Duration.',
    use:'Когда Duration/Radius уже с запасом и нужно быстро добрать Intensity.',
    avoid:'Требует аккуратной варки с водой первой; остаточные хлор+фтор могут запустить bad-reaction.',
  },
  copper:{
    role:'Краситель огня',
    summary:'Почти чисто косметический реагент: красит итоговый dynamic-fire в зелёный, но не добавляет Power/Intensity/Radius/Duration.',
    how:'Прямых боевых modifiers нет. BurnColor #78be5a имеет вес 4, поэтому медь заметно тянет итоговый смешанный цвет в зелёную сторону.',
    use:'Когда нужен именно зелёный визуальный цвет обычного dynamic-fire.',
    avoid:'Не путай визуально зелёный dynamic-fire с RMCTileFireGreen: медь НЕ даёт slow или xeno armor modifier. Weighted BurnColor также способен заменить специальный FireEntity на STTileFireDynamic.',
  },
  iron:{
    role:'Шрапнель',
    summary:'Вообще не меняет Power или огонь — создаёт физические AP-осколки.',
    how:'Каждые полные 4u железа в одной записи раствора = 1 CMProjectileShrapnel (25 Piercing, AP20), до cap корпуса.',
    use:'Контактные/направленные frag-заряды, особенно M20.',
    avoid:'Дробление железа по разным мензуркам может потерять осколки из-за floor() на каждом растворе.',
  },
  potassium_chlorophoride:{
    role:'Токсин',
    summary:'В custom ordnance прямого Power/Fire-вклада не имеет.',
    how:'Боевые эффекты относятся к попаданию реагента в организм, а не к ExplosionSystem.',
    use:'Не как обычный модификатор взрыва.',
    avoid:'Занимает объём без прямого бонуса к blast/fire.',
  },
  ammonia:{role:'Прекурсор',summary:'Сырьё для Ammonium Nitrate и Hexamine.',how:'Прямых blast/fire modifiers нет.',use:'Перерабатывать дальше.',avoid:'В финальном payload занимает объём почти впустую.'},
  polytrinic:{role:'Прекурсор',summary:'Ключевой реагент AN, Cyclonite, Octogen и Nitroglycerin.',how:'Прямых blast/fire modifiers нет.',use:'Перерабатывать дальше.',avoid:'С Hexamine автоматически образует Cyclonite, а с полным набором Octogen — Octogen.'},
  formaldehyde:{role:'Прекурсор',summary:'Нужен для Hexamine и через Industry Freezer для Paraformaldehyde.',how:'Прямых blast/fire modifiers нет.',use:'Производственный техдрев Octogen.',avoid:'Не трать финальный объём на него.'},
  paraformaldehyde:{role:'Прекурсор Octogen',summary:'Получается в Industry Freezer из Formaldehyde + Water 1:1.',how:'Прямых blast/fire modifiers нет.',use:'Делать Octogen.',avoid:'Сам по себе боеприпас не усиливает.'},
  glycerol:{role:'Прекурсор Nitroglycerin',summary:'Нужен для нитроглицерина.',how:'Прямых blast/fire modifiers нет.',use:'Только производство.',avoid:'Не путай RMCCornOil с обычным Cornoil при варке.'},
  corn_oil:{role:'Сырьё',summary:'RMC-кукурузное масло для Glycerol.',how:'Прямых blast/fire modifiers нет.',use:'3u RMCCornOil + 1u RMC Sulphuric Acid → 1u Glycerol.',avoid:'Обычный Cornoil — другой reagent ID.'},
  sulfuric_acid:{role:'Сырьё',summary:'Компонент Glycerol/Nitroglycerin/Napalm.',how:'Прямых blast/fire modifiers нет.',use:'Только производственные реакции.',avoid:'Само по себе заряд не усиливает.'},
  chlorine:{role:'Сырьё',summary:'Компонент Polytrinic и ClF3.',how:'Прямых blast/fire modifiers нет.',use:'Производство.',avoid:'Хлор + фтор без достаточной воды опасны для ClF3-chain.'},
  fluorine:{role:'Сырьё',summary:'Компонент ClF3.',how:'Прямых blast/fire modifiers нет.',use:'Производство ClF3.',avoid:'Не смешивай с хлором без достаточного количества воды.'},
  potassium:{role:'Сырьё',summary:'Компонент Polytrinic.',how:'Прямых blast/fire modifiers нет.',use:'Производство.',avoid:'С водой запускает KOH sensitive reaction threshold 0.'},
  nitrogen:{role:'Сырьё',summary:'Компонент Ammonia.',how:'Прямых blast/fire modifiers нет.',use:'Производство Ammonia.',avoid:'В финальном payload бесполезен.'},
  aluminium:{role:'Сырьё',summary:'Компонент Napalm.',how:'Прямых blast/fire modifiers нет.',use:'Производство Napalm.',avoid:'Phoron + Aluminium + Sulphuric Acid без воды — опасная bad-reaction.'},

  frost_oil:{role:'Скрыт',summary:'Старый/спорный путь Paraformaldehyde.',how:'В текущем рабочем OT-техдреве не нужен: Paraformaldehyde делается в Industry Freezer.',use:'Не нужен для штатного Octogen-chain.',avoid:'Не путать с обычным FrostOil из Chilly Pepper.'},
  napalm_ut:{role:'Скрыт',summary:'Специальное огнемётное топливо.',how:'Не подтверждён надёжный штатный путь извлечения свободной жидкости в мензурку.',use:'Справочная запись.',avoid:'Не строить рабочий OT-рецепт вокруг закрытого flamer tank.'},
  bgel:{role:'Скрыт · special fire',summary:'Потенциально выбирает RMCTileFireGreen.',how:'Custom modifier как у базового напалма: ≈ +0.45 I / +0.06 R / +0.75 D на 1u. Green fire замедляет ×0.666 и использует armorMultiplier 0.5 против Xeno.',use:'Справочно: anti-xeno fire.',avoid:'Не считать штатно доступным OT. Weighted BurnColor в смеси способен заменить Green FireEntity на STTileFireDynamic.'},
  napalm_b:{role:'Скрыт · special fire',summary:'Потенциально выбирает RMCTileFireGreen и имеет fireSpread.',how:'Стат-модификатор базового напалма; special green tile-fire даёт slow/armor interaction против Xeno.',use:'Справочная запись.',avoid:'Не считать доступным свободным реагентом OT; цветовые добавки способны переопределить FireEntity.'},
  napalm_x:{role:'Скрыт · special fire',summary:'Потенциально выбирает RMCTileFireBlue.',how:'Стат-модификатор базового напалма. Blue fire имеет maxStacks 40.',use:'Справочно: high-stack fire.',avoid:'Не считать доступным свободным реагентом OT; weighted BurnColor может заменить special entity.'},
  napalm_e:{role:'Скрыт · penetrating fire',summary:'Napalm E несёт RMCFireImmunityBypass.',how:'Custom modifier как у базового напалма плюс FirePenetrating=true.',use:'Справочно: огонь, способный обходить обычный tile-fire immunity.',avoid:'Штатный источник свободного реагента для OT не подтверждён.'},
  napalm_ex:{role:'Скрыт · penetrating fire',summary:'Усиленный penetrating fire prototype.',how:'Additive modifiers как у базового напалма; главное отличие — penetrating FireEntity/flag, а не поле intensity:40.',use:'Справочная запись.',avoid:'Штатный источник свободного реагента для OT не подтверждён.'},
  r189:{role:'Скрыт · penetrating fire',summary:'Специальный penetrating fire prototype.',how:'В custom ordnance числовые modifiers идут от базового напалма; intensity:50 самого fire entity не означает +50 к корпусу.',use:'Справочная запись.',avoid:'Штатный источник свободного реагента для OT не подтверждён.'},
};

export function effectParts(id){
  const c=CHEMS[id];
  if(!c)return [];
  const parts=[];
  if(c.p)parts.push({key:'power',label:`Power ${signed(c.p)} /u`,tone:'blast'});
  if(c.f)parts.push({key:'falloff',label:`Falloff ${signed(c.f)} /u`,tone:c.f<0?'good':'warn'});
  if(c.i)parts.push({key:'intensity',label:`Fire I ${signed(c.i)} /u`,tone:c.i>0?'fire':'warn'});
  if(c.r)parts.push({key:'radius',label:`Fire R ${signed(c.r)} /u`,tone:c.r>0?'good':'warn'});
  if(c.d)parts.push({key:'duration',label:`Fire D ${signed(c.d)} /u`,tone:c.d>0?'good':'warn'});
  if(c.shrapnel)parts.push({key:'shrapnel',label:'4u = 1 AP-осколок',tone:'frag'});
  if(c.firePenetrating)parts.push({key:'penetrating',label:'penetrating fire',tone:'fire'});
  if(c.fireEntity && c.fireEntity!=='RMCTileFire')parts.push({key:'entity',label:`FireEntity: ${fireEntityLabel(c.fireEntity,c.firePenetrating)}`,tone:'fire'});
  if(c.burnColor && c.burnWeight>0)parts.push({key:'color',label:`цвет ×${c.burnWeight}`,tone:'color'});
  if(!parts.length)parts.push({key:'none',label:'нет прямого ordnance-вклада',tone:'muted'});
  return parts;
}

export function directSource(id){
  const c=CHEMS[id];
  if(!c)return 'неизвестно';
  if(STOCKED.has(id))return 'штатный бак OT';
  if(c.source)return c.source;
  if(RECIPES[id])return 'производится по рецепту';
  return 'диспенсер / внешний источник';
}

export function signed(v){
  if(!v)return '0';
  return `${v>0?'+':''}${Number(v.toFixed(3))}`;
}


export const FIRE_ENTITY_NAMES={
  RMCTileFire:'обычный tile-fire',
  RMCTileFireEthanol:'этаноловый огонь',
  RMCTileFireNapalmBase:'базовый напалм',
  RMCTileFireStickyNapalm:'липкий напалм',
  RMCTileFireHCNapalm:'HC-напалм',
  RMCTileFireGreen:'зелёный anti-xeno fire',
  RMCTileFireBlue:'синий high-stack fire',
  RMCTileFireNapalmE:'Napalm E · immunity bypass',
  RMCTileFireNapalmEX:'Napalm EX · immunity bypass',
  RMCTileFireR189:'R189 · immunity bypass',
  STTileFireDynamic:'динамический обычный огонь',
  STTileFireDynamicPenetrating:'динамический penetrating fire',
};

export function fireEntityLabel(entity,penetrating=false){
  if(!entity)return '—';
  const name=FIRE_ENTITY_NAMES[entity]||entity;
  return penetrating && !name.includes('bypass') && !name.includes('penetrating') ? name+' · penetrating' : name;
}
