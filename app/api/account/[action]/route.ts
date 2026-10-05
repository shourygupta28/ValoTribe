import {db} from '../../../../lib/db';
import {currentUser,logout,limitAuth} from '../../../../lib/auth';
import {input,json,failure} from '../../../../lib/http';
import {InputError,text} from '../../../../lib/validation';
import {digest,hashPassword,verifyPassword} from '../../../../lib/security.mjs';
import {issueAccountToken} from '../../../../lib/account-tokens';
import {emailReady,POLICY_VERSION} from '../../../../lib/config';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 try{
 const body=await input(request),{action}=await params;
 if(['verify','reset'].includes(action)){
  const token=text(body.token,64,64,'Token');if(!/^[a-f0-9]{64}$/.test(token))throw new InputError('Invalid or expired link.');
  const purpose=action==='verify'?'VERIFY':'RESET';
  if(action==='reset'&&(typeof body.password!=='string'||body.password.length<12||body.password.length>128))throw new InputError('Password must be 12–128 characters.');
  const passwordHash=action==='reset'?await hashPassword(body.password):undefined;
  await db.$transaction(async tx=>{
   const row=await tx.accountToken.findUnique({where:{tokenHash:digest(token)}});
   if(!row||row.purpose!==purpose||row.expiresAt<=new Date())throw new InputError('Invalid or expired link.');
   const consumed=await tx.accountToken.deleteMany({where:{tokenHash:row.tokenHash,expiresAt:{gt:new Date()}}});if(!consumed.count)throw new InputError('Invalid or expired link.');
   await tx.user.update({where:{id:row.userId},data:action==='verify'?{emailVerifiedAt:new Date()}:{passwordHash}});
   await tx.accountToken.deleteMany({where:{userId:row.userId,purpose}});
   if(action==='reset')await tx.session.deleteMany({where:{userId:row.userId}});
  });return json({ok:true});
 }
 if(action==='forgot'){
  if(!emailReady())return json({error:'Password recovery is not configured. Contact the operator.'},503);
  const email=text(body.email,3,254,'Email').toLowerCase();
  if(!await limitAuth('recovery:'+email))return json({error:'Too many requests. Try again in 15 minutes.'},429);
  const user=await db.user.findUnique({where:{email}});
  if(user?.email)try{await issueAccountToken(user.id,user.email,'RESET')}catch{console.error('Account email delivery failed');}
  return json({ok:true,message:'If this account exists, a reset email will be sent.'});
 }
 const user=await currentUser();if(!user)return json({error:'Sign in required.'},401);
 if(action==='accept-policies'){
  if(body.acceptTerms!==true)throw new InputError('Accept the Terms and Privacy Policy to continue.');
  await db.user.update({where:{id:user.id},data:{termsAcceptedAt:new Date(),policyVersion:POLICY_VERSION}});return json({ok:true});
 }
 if(action==='resend'){
  if(!emailReady())return json({error:'Email verification is not configured. Contact the operator.'},503);
  if(!await limitAuth('verify:'+user.id))return json({error:'Too many requests. Try again in 15 minutes.'},429);
  if(!user.emailVerifiedAt&&user.email)await issueAccountToken(user.id,user.email,'VERIFY');return json({ok:true});
 }
 if(action==='delete'){
  if(!await limitAuth('delete:'+user.id))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
  if(body.confirmation!=='DELETE')throw new InputError('Type DELETE to confirm.');
  if(typeof body.password!=='string'||body.password.length>128||!await verifyPassword(body.password,user.passwordHash))return json({error:'Password is incorrect.'},401);
  await db.$transaction(async tx=>{await tx.report.deleteMany({where:{subjectId:user.id}});await tx.user.delete({where:{id:user.id}})});
  await logout();return json({ok:true});
 }
 if(action==='disconnect'){
  await db.$transaction(async tx=>{await tx.riotLink.deleteMany({where:{userId:user.id}});await tx.passport.updateMany({where:{userId:user.id},data:{discoveryOptIn:false,visibility:'PRIVATE'}})});
  return json({ok:true});
 }
 return json({error:'Not found'},404);
 }catch(error){return failure(error)}
}
