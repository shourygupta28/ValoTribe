import {hashPassword} from '../lib/security.mjs';

export const DEMO_PASSWORD='ValoTribe-Demo-2026!';
export const DEMO_ACCOUNTS=[
 {key:'controller',name:'Demo Controller',roles:['Controller'],agents:['Omen','Clove'],languages:['Hindi','English'],rank:'Diamond',start:1260,end:60},
 {key:'duelist',name:'Demo Duelist',roles:['Duelist'],agents:['Jett','Raze'],languages:['Hindi','English'],rank:'Platinum',start:1200,end:1440},
 {key:'sentinel',name:'Demo Sentinel',roles:['Sentinel'],agents:['Killjoy','Cypher'],languages:['English','Tamil'],rank:'Diamond',start:1320,end:120},
 {key:'initiator',name:'Demo Initiator',roles:['Initiator'],agents:['Sova','Fade'],languages:['English','Telugu'],rank:'Gold',start:1080,end:1260,intent:'Casual'},
 {key:'private',name:'Demo Private',roles:['Controller'],agents:['Omen'],languages:['English'],rank:'Silver',start:1260,end:1440,private:true},
 {key:'unverified',name:'Demo Unverified',roles:['Duelist'],agents:['Reyna'],languages:['English'],rank:'Bronze',start:1260,end:1440,private:true,unverified:true},
 {key:'new',name:'Demo New Player',roles:[],agents:[],languages:[],rank:'Unranked',start:1260,end:1440,private:true,new:true},
].map(account=>({...account,id:`valotribe-demo-${account.key}`,email:`demo.${account.key}@example.test`}));

// Create-only: rerunning never resets passwords, privacy choices or other test edits.
export async function seedDemoAccounts(db){
 const now=new Date();
 const passwordHash=await hashPassword(DEMO_PASSWORD);
 return db.$transaction(async tx=>{
  let created=0;
  for(const account of DEMO_ACCOUNTS){
   const existing=await tx.user.findFirst({where:{OR:[{id:account.id},{email:account.email}]}});
   if(existing){
    if(existing.id!==account.id||existing.email!==account.email)throw new Error(`Demo identifier collision: ${account.key}`);
    continue;
   }
   await tx.user.create({data:{id:account.id,email:account.email,displayName:account.name,passwordHash,
    emailVerifiedAt:account.unverified?null:now,termsAcceptedAt:now,policyVersion:'2026-10-03',
    passport:{create:{visibility:account.private?'PRIVATE':'PUBLIC',discoveryOptIn:!account.private,
     roles:account.roles,agents:account.agents,languages:account.languages,rank:account.rank,
     timeZone:'Asia/Kolkata',availability:{start:account.start,end:account.end},
     queueIntent:account.intent??'Competitive',onboarded:!account.new}}
   }});
   created++;
   if(!account.private)await tx.lFGPost.create({data:{id:`${account.id}-lfg`,authorId:account.id,
    title:account.key==='initiator'?'[Demo] Casual Mumbai games, English comms':'[Demo] Evening Mumbai practice, looking for teammates',
    region:'Mumbai',rolesNeeded:account.key==='controller'?['Duelist','Sentinel']:['Controller'],
    expiresAt:new Date(now.getTime()+24*60*60*1000)}});
  }
  return created;
 });
}
