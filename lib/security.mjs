import {randomBytes,scrypt as callbackScrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(callbackScrypt);
export const digest=value=>createHash('sha256').update(value).digest('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return `${salt}:${key.toString('hex')}`}
export async function verifyPassword(password,stored){if(!stored)return false;const [salt,hex]=stored.split(':');if(!salt||!hex)return false;const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});const expected=Buffer.from(hex,'hex');return expected.length===key.length&&timingSafeEqual(expected,key)}
export const newToken=()=>randomBytes(32).toString('hex');
