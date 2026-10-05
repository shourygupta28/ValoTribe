export const ROLES=['Initiator','Controller','Sentinel','Duelist'];
export const LANGUAGES=['Hindi','English','Tamil','Telugu','Bengali','Marathi','Kannada','Malayalam','Punjabi'];
export const RANKS=['Unranked','Iron','Bronze','Silver','Gold','Platinum','Diamond','Ascendant','Immortal','Radiant'];
export const INTENTS=['Competitive','Casual'];
export class InputError extends Error {}
export function text(value:unknown,min:number,max:number,label:string){if(typeof value!=='string'||value.trim().length<min||value.trim().length>max)throw new InputError(`${label} must be ${min}–${max} characters.`);return value.trim()}
export function one(value:unknown,choices:string[],label:string){if(typeof value!=='string'||!choices.includes(value))throw new InputError(`Choose a valid ${label}.`);return value}
function many(value:unknown,choices:string[],label:string){if(!Array.isArray(value)||value.length<1||value.length>choices.length||value.some(x=>typeof x!=='string'||!choices.includes(x)))throw new InputError(`Choose at least one valid ${label}.`);return [...new Set(value)] as string[]}
export function profileInput(body:Record<string,unknown>){
 const start=Number(body.start),end=Number(body.end);
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||start>=1440||end<0||end>1440||start===end)throw new InputError('Choose a valid play window.');
 if(typeof body.discoveryOptIn!=='boolean')throw new InputError('Choose your discovery preference.');
 const visibility=one(body.visibility,['PRIVATE','PUBLIC'],'visibility') as 'PRIVATE'|'PUBLIC';
 if(body.discoveryOptIn&&visibility!=='PUBLIC')throw new InputError('Discovery requires a public Passport.');
 const agents=typeof body.agents==='string'?body.agents.split(',').map(x=>x.trim()).filter(Boolean):[];
 if(agents.length>10||agents.some(x=>x.length>30))throw new InputError('Enter up to 10 agent names, each under 30 characters.');
 return {displayName:text(body.displayName,2,40,'Display name'),roles:many(body.roles,ROLES,'role'),languages:many(body.languages,LANGUAGES,'language'),rank:one(body.rank,RANKS,'rank'),queueIntent:one(body.intent,INTENTS,'queue intent'),agents,availability:{start,end},visibility,discoveryOptIn:body.discoveryOptIn,onboarded:true};
}
