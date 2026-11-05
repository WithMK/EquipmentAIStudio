import type { ProductRecord, Inspection, InspectionImage } from '../../shared/domain/models';
/** Fixed UTC baseline, stable compound IDs; no time/random dependence. */
export function createInspectionFixtures(equipmentCount=9, lotsPerMachine=6): ProductRecord[] {
 const records:ProductRecord[]=[];
 for(let m=1;m<=equipmentCount;m++) for(let l=1;l<=lotsPerMachine;l++) {
  const machineId=`EQ${String(m).padStart(2,'0')}`;
  const lotId=`LOT-202611${String(l).padStart(2,'0')}-${String(m).padStart(2,'0')}`;
  const lot={id:`${machineId}:${lotId}`,machineId,lotId,startedAt:new Date(Date.UTC(2026,10,l,0)).toISOString()};
  for(let p=1;p<=8;p++) {
   const id=`${machineId}-${lotId}-P${String(p).padStart(3,'0')}`;
   const product={id,productId:`P${String(p).padStart(3,'0')}`,lotId:lot.id,machineId,...(p<=4?{parentProductId:`${lot.id}:BAR01`,segmentIndex:p}:{})};
   const inspections:Inspection[]=[],images:InspectionImage[]=[];
   for(const type of ['SIDE','THERMAL']) {
    const repeat=p===2 && type==='SIDE';
    for(let attempt=0;attempt< (repeat?2:1);attempt++) {
     const inspectionId=`${id}:${type}:${attempt}`;
     const ng=(p===1 || (p+m+l)%5===0) && type==='SIDE' || (repeat && attempt===0);
     const inspectedAt=new Date(Date.UTC(2026,10,l,m,p*3+attempt)).toISOString();
     inspections.push({id:inspectionId,productId:id,inspectionRunId:inspectionId,type,inspectedAt,originalVerdict:ng?'NG':'OK',...(attempt?{supersedesInspectionId:`${id}:${type}:0`}:{})});
     for(let n=1;n<=(type==='SIDE'?8:4);n++) images.push({id:`${inspectionId}:${n}`,inspectionId,capturePoint:`${type}-${n}`,capturedAt:inspectedAt,originalVerdict:ng&&n===1?'NG':'OK',availability:p===3&&n===1?'missing':'available'});
    }
   }
   records.push({product,lot,inspections,images});
  }
 }
 return records;
}
