import {InputError} from './validation';
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}})}
export async function input(request:Request){
 const origin=process.env.APP_ORIGIN;
 if(!origin)throw new Error('APP_ORIGIN must be configured.');
 if(request.headers.get('origin')!==origin)throw new InputError('Request origin rejected.');
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new InputError('JSON body required.');
 const reader=request.body?.getReader();if(!reader)throw new InputError('Request body required.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16384){await reader.cancel();throw new InputError('Request is too large.')}chunks.push(value);}
 try{const body=JSON.parse(Buffer.concat(chunks).toString());if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();return body as Record<string,unknown>}catch{throw new InputError('Invalid JSON body.');}
}
export function failure(error:unknown){if(error instanceof InputError)return json({error:error.message},400);console.error('ValoTribe request failed',error instanceof Error?error.name:'Unknown',typeof error==='object'&&error&&'code' in error?String(error.code):'');return json({error:'Unable to complete the request. Please try again.'},500)}
