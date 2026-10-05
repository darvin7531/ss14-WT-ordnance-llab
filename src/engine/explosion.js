const f32 = v => Math.fround(v);

// Open-grid reproduction of SS14 ExplosionSystem's intensity distribution.
// It deliberately does NOT model walls/airtight blockers. In empty grid the discovery iteration
// of coordinate (x,y) is 2*max(|x|,|y|)+min(|x|,|y|): cardinal movement costs 2 iterations,
// diagonal movement costs 3.

export function tileIteration(x,y){
  const ax=Math.abs(x), ay=Math.abs(y);
  return 2*Math.max(ax,ay)+Math.min(ax,ay);
}

export function countOpenGridTilesAtIteration(iteration){
  if(iteration===0) return 1;
  if(iteration<2) return 0;
  // Small and exact enough for ordnance ranges: enumerate the weighted-distance diamond.
  const lim=Math.ceil(iteration/2)+1;
  let n=0;
  for(let x=-lim;x<=lim;x++){
    for(let y=-lim;y<=lim;y++) if(tileIteration(x,y)===iteration) n++;
  }
  return n;
}

export function distributeOpenGrid({totalIntensity,slope,maxIntensity,maxIterations=500}){
  if(totalIntensity<=0 || slope<=0) return {intensities:[],counts:[],affectedTiles:0,maxIteration:0};
  const stepSize=f32(slope/2);
  if(totalIntensity<stepSize){
    return {intensities:[totalIntensity],counts:[1],affectedTiles:1,maxIteration:0,stepSize};
  }

  const counts=[1];
  const intensities=[stepSize];
  let affectedTiles=1;
  let remaining=f32(totalIntensity-stepSize);
  let iteration=1;
  let maxIntensityIndex=0;

  while(remaining>1e-9 && iteration<=maxIterations){
    for(let i=maxIntensityIndex;i<iteration;i++){
      const count=counts[i]||0;
      const current=intensities[i]||0;
      const increase=f32(Math.min(stepSize, Math.max(0,f32(maxIntensity-current))));
      if(count*increase>=remaining && count>0){
        intensities[i]=f32(current+f32(remaining/count));
        remaining=0;
        break;
      }
      intensities[i]=f32(current+increase);
      remaining=f32(remaining-f32(count*increase));
      if(increase<stepSize) maxIntensityIndex++;
    }
    if(remaining<=1e-9) break;

    const newCount=countOpenGridTilesAtIteration(iteration);
    counts.push(newCount);
    if(newCount*stepSize>=remaining && newCount>0){
      intensities.push(f32(remaining/newCount));
      affectedTiles+=newCount;
      remaining=0;
      break;
    }
    remaining=f32(remaining-f32(newCount*stepSize));
    intensities.push(stepSize);
    affectedTiles+=newCount;
    iteration++;
  }

  let maxIteration=0;
  for(let i=0;i<counts.length;i++) if((counts[i]||0)>0 && (intensities[i]||0)>0) maxIteration=i;
  return {intensities,counts,affectedTiles,maxIteration,stepSize,remaining:Math.max(0,remaining)};
}

export function simulateOpenGrid(engine, multiplier=1){
  const params={...engine,totalIntensity:f32(engine.totalIntensity*multiplier)};
  const dist=distributeOpenGrid(params);
  const intensityAt=(x,y)=>dist.intensities[tileIteration(x,y)]||0;
  const coords=[];
  const lim=Math.ceil(dist.maxIteration/2)+1;
  for(let y=lim;y>=-lim;y--){
    for(let x=-lim;x<=lim;x++){
      const iteration=tileIteration(x,y);
      const intensity=dist.intensities[iteration]||0;
      if(intensity>0) coords.push({x,y,iteration,intensity});
    }
  }
  return {...dist,intensityAt,coords,limit:lim,params};
}

export function maxCardinalReach(sim){
  let d=0;
  while(sim.intensityAt(d+1,0)>0) d++;
  return d;
}
