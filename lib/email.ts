import {emailReady} from './config';
export async function sendAccountEmail(to:string,purpose:'VERIFY'|'RESET',token:string){
 if(!emailReady())throw new Error('Email delivery is not configured.');
 const url=new URL('/account',process.env.APP_ORIGIN);url.hash=new URLSearchParams({purpose,token}).toString();
 const label=purpose==='VERIFY'?'Verify your email':'Reset your password';
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[to],subject:`ValoTribe — ${label}`,text:`${label}: ${url.toString()}

This single-use link expires in ${purpose==='VERIFY'?'24 hours':'30 minutes'}. If you did not request this, ignore this message.`}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('Email delivery failed.');
}
