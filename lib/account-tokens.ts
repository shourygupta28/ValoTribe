import {db} from './db';
import {digest,newToken} from './security.mjs';
import {sendAccountEmail} from './email';
export async function issueAccountToken(userId:string,email:string,purpose:'VERIFY'|'RESET'){
 const token=newToken(),tokenHash=digest(token),expiresAt=new Date(Date.now()+(purpose==='VERIFY'?86400000:1800000));
 await db.accountToken.create({data:{tokenHash,userId,purpose,expiresAt}});
 try{await sendAccountEmail(email,purpose,token)}catch(error){await db.accountToken.deleteMany({where:{tokenHash}});throw error}
}
