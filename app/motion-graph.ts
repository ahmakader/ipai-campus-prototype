export const parents:Record<string,string>={
 kommunikationszentrum_tag_landscape:'luftbild',hochhaus:'luftbild',reallabor:'luftbild',start_up_center:'luftbild',mobility_hub:'luftbild',restaurant_ost:'luftbild',piazza:'kommunikationszentrum_tag_landscape',aussenanlagen_promenade:'piazza',aussenanlage:'aussenanlagen_promenade',promenaden_1:'hochhaus',promenaden_2:'promenaden_1',hochhaus_eingang:'hochhaus',hochhaus_ost:'hochhaus',hochhaus_sud:'hochhaus_ost',reallabor_nord:'reallabor',restaurant_sud:'restaurant_ost',kommunikationszentrum_nacht_landscape:'kommunikationszentrum_tag_landscape',kommunikationszentrum_tag:'kommunikationszentrum_tag_landscape',kommunikationszentrum_nacht:'kommunikationszentrum_tag',region:'luftbild','spaces-view':'region'
};
export type Leg={from:string;to:string;src:string};
export const loopFor=(node:string)=>`./motion/${node}-loop.mp4`;
export function route(from:string,to:string):Leg[]{
 if(from===to)return [];
 const ancestry=(n:string)=>{const a=[n];while(parents[n]){n=parents[n];a.push(n)}return a;};
 const a=ancestry(from),b=ancestry(to),join=a.find(n=>b.includes(n));if(!join)return [];
 const out:Leg[]=[];for(let i=0;i<a.indexOf(join);i++)out.push({from:a[i],to:a[i+1],src:`./motion/${a[i]}-out.mp4`});
 for(let i=b.indexOf(join)-1;i>=0;i--)out.push({from:b[i+1],to:b[i],src:`./motion/${b[i]}-in.mp4`});return out;
}
