// Loaded only by the integration test subprocess, never by the app startup scripts.
import {appendFile,readFile} from 'node:fs/promises';
const originalFetch=globalThis.fetch;
globalThis.fetch=async function(url,options){
 if(String(url)==='https://api.resend.com/emails'){
  if(await readFile(process.env.TEST_MAIL_MODE,'utf8')==='fail')return new Response('{}',{status:503});
  await appendFile(process.env.TEST_MAIL_OUT,JSON.stringify(JSON.parse(options.body))+'\n');
  return Response.json({id:'test-message'});
 }
 return originalFetch(url,options);
};
