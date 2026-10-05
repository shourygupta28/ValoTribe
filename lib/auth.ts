import {cookies} from 'next/headers';
import {db} from './db';
import {digest,newToken} from './security.mjs';
export const COOKIE='valotribe_session';
export async function currentUser(){
 const token=(await cookies()).get(COOKIE)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const session=await db.session.findUnique({where:{tokenHash:digest(token)},include:{user:{include:{passport:true}}}});
 return session&&!session.user.suspendedAt&&session.expiresAt>new Date()?session.user:null;
}
export async function createSession(userId:string){const token=newToken(),expiresAt=new Date(Date.now()+7*24*60*60*1000);await db.session.create({data:{userId,tokenHash:digest(token),expiresAt}});(await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE!=='false',path:'/',expires:expiresAt});}
export async function logout(){const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token)await db.session.deleteMany({where:{tokenHash:digest(token)}});jar.set(COOKIE,'',{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE!=='false',path:'/',maxAge:0});}
export async function limitAuth(email:string){
 const key=digest(email),now=new Date();
 const [row]=await db.$queryRaw<{attempts:number}[]>`INSERT INTO "AuthAttempt" ("key","attempts","expiresAt") VALUES (${key},1,${new Date(Date.now()+15*60*1000)}) ON CONFLICT ("key") DO UPDATE SET "attempts"=CASE WHEN "AuthAttempt"."expiresAt"<${now} THEN 1 ELSE "AuthAttempt"."attempts"+1 END,"expiresAt"=CASE WHEN "AuthAttempt"."expiresAt"<${now} THEN EXCLUDED."expiresAt" ELSE "AuthAttempt"."expiresAt" END RETURNING "attempts"`;
 return row.attempts<=10;
}
