import { XENOS } from '../data.js';

export function explosionCoefficient(explosionArmor, extraExplosionArmor=0){
  const armor=Math.max(0,explosionArmor+extraExplosionArmor);
  return 2/Math.pow(1.1,armor/5);
}

export function blastDamage(intensity,xeno,{extraExplosionArmor=0}={}){
  // RMC explosion = 5 Blunt + 5 Heat per intensity. GetExplosionResistance modifies the whole DamageSpecifier.
  // Damage is then applied with ignoreResistances:true, so ordinary XenoArmor is not applied again.
  return intensity*10*explosionCoefficient(xeno.ea,extraExplosionArmor);
}

export function controlFromExplosionDamage(damage,xeno){
  let factor=Math.round(damage*0.05)/2;
  factor=Math.min(20,factor);
  if(factor<=0) return {factor,stun:0,knockdown:0,slow:0,works:false};
  if(xeno.weak){
    return {factor,stun:factor/2.5,knockdown:factor/2.5,slow:xeno.size==='big'||xeno.size==='immobile'?factor/3:factor,works:true};
  }
  if(factor>10){
    factor/=5;
    return {factor,stun:factor/5,knockdown:factor/5,slow:xeno.size==='big'||xeno.size==='immobile'?factor/3:factor,works:true};
  }
  return {factor,stun:0,knockdown:0,slow:0,works:false};
}

function applyGenericShield(damage,shieldHp){
  const absorbed=Math.min(damage,Math.max(0,shieldHp));
  return {body:Math.max(0,damage-absorbed),absorbed,shieldLeft:Math.max(0,shieldHp-absorbed)};
}

export function simulateHit({xenoId,intensity,activeClassShield=false,genericShield=0,vanguardWasHit=false}){
  const xeno=XENOS[xenoId];
  if(!xeno) throw new Error(`Unknown xeno ${xenoId}`);
  let extraEA=0;
  let special='';

  if(activeClassShield && xeno.specialShield==='crusher'){
    extraEA=1000;
    special='Crusher Defensive Shield: +1000 Explosion Resistance на первые 2.5 с.';
  }
  if(activeClassShield && xeno.specialShield==='vanguard'){
    extraEA=75;
    special='Vanguard Shield: +75 Explosion Resistance пока щит активен.';
  }

  const eventDamage=blastDamage(intensity,xeno,{extraExplosionArmor:extraEA});
  let appliedDamage=eventDamage;

  // VanguardShieldSystem runs inside DamageModifyAfterResistEvent and can clamp the applied copy to zero.
  // ExplosionReceivedEvent is raised afterwards with the OUTER post-ExplosionResistance damage, so blast-control
  // still uses eventDamage even when the shield absorbs/cancels the HP damage.
  let vanguardTriggered=false;
  if(activeClassShield && xeno.specialShield==='vanguard' && !vanguardWasHit && eventDamage>5){
    vanguardTriggered=true;
    appliedDamage=0;
    special+=' Первая значимая атака щита обнуляется по HP, но ExplosionReceivedEvent всё ещё видит post-resistance blast для контроля.';
  }

  // Crusher subtracts 10 from EACH positive damage type after resist before XenoShield; blast has Blunt + Heat.
  if(activeClassShield && xeno.specialShield==='crusher'){
    const perType=appliedDamage/2;
    appliedDamage=Math.max(0,perType-10)*2;
  }

  let shieldHp=Math.max(0,Number(genericShield)||0);
  if(activeClassShield && xeno.specialShield==='crusher') shieldHp=Math.max(shieldHp,200);
  if(activeClassShield && xeno.specialShield==='vanguard') shieldHp=Math.max(shieldHp,800);

  const shield=applyGenericShield(appliedDamage,shieldHp);
  const control=controlFromExplosionDamage(eventDamage,xeno);
  return {xeno,intensity,preShieldDamage:eventDamage,appliedBeforeShield:appliedDamage,bodyDamage:shield.body,shieldAbsorbed:shield.absorbed,shieldLeft:shield.shieldLeft,control,special,vanguardTriggered};
}

export function outcomeLabel(totalDamage,xeno){
  if(totalDamage>=xeno.hp) return {key:'dead',text:'смерть / порог смерти',tone:'danger'};
  if(totalDamage>=xeno.crit) return {key:'crit',text:'критическое состояние',tone:'danger'};
  const ratio=totalDamage/xeno.hp;
  if(ratio>=0.65) return {key:'heavy',text:'тяжело ранен — сильное давление на отход',tone:'warn'};
  if(ratio>=0.4) return {key:'hurt',text:'серьёзно ранен — вероятный отход',tone:'warn'};
  if(ratio>=0.2) return {key:'chip',text:'заметно ранен, но ещё боеспособен',tone:'info'};
  return {key:'low',text:'слабое давление по этой касте',tone:'muted'};
}

export function shardDamagePerHit(xeno){
  // CMProjectileShrapnel: 25 Piercing, AP20. CMArmorSystem subtracts AP from XenoArmor,
  // then applies exponential armor reduction and low-damage floor logic.
  // This is intentionally an estimate because projectile origin/directional armor/shields can alter the result.
  const effectiveArmor=Math.max(0,(xeno.xenoArmor||0)-20);
  let damage=25/Math.pow(1.1,effectiveArmor/5);
  if(damage>0 && damage<effectiveArmor*2){
    const adjusted=Math.max(0,damage*4-effectiveArmor);
    damage=damage*(adjusted/(damage*4));
  }
  return damage;
}
