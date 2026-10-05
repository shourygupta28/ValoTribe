import {Prisma} from '@prisma/client';
import {db} from '../../../../lib/db';
import {createSession,logout,limitAuth} from '../../../../lib/auth';
import {hashPassword,verifyPassword} from '../../../../lib/security.mjs';
import {input,json,failure} from '../../../../lib/http';
import {InputError,text} from '../../../../lib/validation';
import {signupReady,POLICY_VERSION} from '../../../../lib/config';
import {issueAccountToken} from '../../../../lib/account-tokens';
export const runtime='nodejs';
export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
 try{const body=await input(request);const {action}=await params;
 if(action==='logout'){await logout();return json({ok:true})}
 if(!['signup','login'].includes(action))return json({error:'Not found'},404);
 if(action==='signup'&&!signupReady())return json({error:'Registration is not open yet. Explore the reviewer demo.'},503);
 const email=text(body.email,3,254,'Email').toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new InputError('Enter a valid email.');
 if(typeof body.password!=='string'||body.password.length<12||body.password.length>128)throw new InputError('Password must be 12–128 characters.');
 if(!await limitAuth(email))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 if(action==='signup'){
 if(body.acceptTerms!==true)throw new InputError('Accept the Terms and Privacy Policy to continue.');
 const displayName=text(body.displayName,2,40,'Display name');
 try{const user=await db.user.create({data:{email,displayName,termsAcceptedAt:new Date(),policyVersion:POLICY_VERSION,passwordHash:await hashPassword(body.password),passport:{create:{roles:[],agents:[],languages:[],availability:{start:1260,end:1440},queueIntent:'Competitive'}}}});await createSession(user.id);try{await issueAccountToken(user.id,email,'VERIFY')}catch{console.error('Verification email delivery failed');}return json({ok:true,message:'Account created. Verify your email before discovery.'},201)}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return json({error:'Unable to create this account. Try signing in.'},409);throw error}
 }
 const user=await db.user.findUnique({where:{email}});
 // Constant-cost password verification even when an account does not exist.
 const fallback='00000000000000000000000000000000:'+ '00'.repeat(64);
 const valid=await verifyPassword(body.password,user?.passwordHash??fallback);
 if(!user||!valid)return json({error:'Email or password is incorrect.'},401);
 if(user.suspendedAt)return json({error:'Account access is restricted. Contact the operator.'},403);
 await createSession(user.id);return json({ok:true});
 }catch(error){return failure(error)}
}
