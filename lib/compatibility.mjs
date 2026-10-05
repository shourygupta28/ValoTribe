export function compatibility(viewer, candidate) {
 const sharedLanguages = viewer.languages.filter(x => candidate.languages.includes(x));
 const slots=p=>p.end>p.start?[[p.start,p.end]]:[[p.start,1440],[0,p.end]];
 const overlap=slots(viewer).reduce((sum,[a,b])=>sum+slots(candidate).reduce((n,[c,d])=>n+Math.max(0,Math.min(b,d)-Math.max(a,c)),0),0);
 const factors = [
 {label:'Role complement',weight:35,value:candidate.roles.some(x=>!viewer.roles.includes(x))?1:0.4},
 {label:'Shared language',weight:25,value:sharedLanguages.length?1:0},
 {label:'Schedule overlap',weight:25,value:Math.min(1,overlap/120)},
 {label:'Queue intent',weight:15,value:viewer.intent===candidate.intent?1:0}];
 return {score:Math.round(factors.reduce((sum,f)=>sum+f.weight*f.value,0)),factors,overlap,sharedLanguages};
}
export function discover(viewer,players,role='All') {
 return players.filter(p=>p.optedIn&&p.visibility==='PUBLIC'&&p.id!==viewer.id&&(role==='All'||p.roles.includes(role))).map(player=>({player,match:compatibility(viewer,player)})).sort((a,b)=>b.match.score-a.match.score);
}
