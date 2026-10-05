import {db} from '../../../lib/db';
import {currentUser,limitAuth} from '../../../lib/auth';
import {input,json,failure} from '../../../lib/http';
import {InputError,text} from '../../../lib/validation';
export async function GET(){const u=await currentUser();if(!u)return json({error:'Sign in required.'},401);return json(await db.block.findMany({where:{blockerId:u.id},select:{blockedId:true,blocked:{select:{displayName:true}}}}))}
export async function POST(request:Request){try{
 const body=await input(request),u=await currentUser();if(!u)return json({error:'Sign in required.'},401);if(!u.emailVerifiedAt)return json({error:'Verify your email first.'},403);
 const subjectId=text(body.subjectId,1,100,'Player');if(subjectId===u.id)throw new InputError('Choose another player.');
 if(body.action==='unblock'){await db.block.deleteMany({where:{blockerId:u.id,blockedId:subjectId}});return json({ok:true})}
 // Report/block only accounts visible to this viewer; no arbitrary user-ID directory.
 const target=await db.user.findFirst({where:{id:subjectId,suspendedAt:null,emailVerifiedAt:{not:null},passport:{is:{onboarded:true,visibility:'PUBLIC',discoveryOptIn:true}},blocks:{none:{blockedId:u.id}},blockedBy:{none:{blockerId:u.id}}}});
 if(!target)return json({error:'Player unavailable.'},404);
 if(body.action==='block'){await db.block.upsert({where:{blockerId_blockedId:{blockerId:u.id,blockedId:subjectId}},create:{blockerId:u.id,blockedId:subjectId},update:{}});return json({ok:true})}
 if(body.action==='report'){
  const reason=text(body.reason,10,1000,'Report');if(!await limitAuth('report:'+u.id))return json({error:'Too many reports. Try later.'},429);
  await db.report.create({data:{reporterId:u.id,subjectId,reason}});return json({ok:true,message:'Report saved for operator review. No automatic penalty is applied.'},201);
 }throw new InputError('Choose a valid action.');
}catch(error){return failure(error)}}
