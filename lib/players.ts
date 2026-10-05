import type {Passport} from '@prisma/client';
import {POLICY_VERSION} from './config';
import {db} from './db';
import type {Player} from './provider';
export function asPlayer(p:Passport&{user:{id:string;displayName:string}}):Player{
 const slot=p.availability as {start:number;end:number};
 return {id:p.user.id,puuid:'',name:p.user.displayName,tag:'Self-reported',rank:p.rank,roles:p.roles,agents:p.agents,languages:p.languages,start:slot.start,end:slot.end,intent:p.queueIntent,optedIn:p.discoveryOptIn,visibility:p.visibility};
}
export async function publicPlayers(viewerId:string){const passports=await db.passport.findMany({where:{userId:{not:viewerId},onboarded:true,discoveryOptIn:true,visibility:'PUBLIC',user:{policyVersion:POLICY_VERSION,suspendedAt:null,emailVerifiedAt:{not:null},blocks:{none:{blockedId:viewerId}},blockedBy:{none:{blockerId:viewerId}}}},include:{user:{select:{id:true,displayName:true}}},take:100});return passports.map(asPlayer)}
export async function feed(viewerId:string){return db.lFGPost.findMany({where:{expiresAt:{gt:new Date()},author:{policyVersion:POLICY_VERSION,suspendedAt:null,emailVerifiedAt:{not:null},blocks:{none:{blockedId:viewerId}},blockedBy:{none:{blockerId:viewerId}},passport:{is:{onboarded:true,discoveryOptIn:true,visibility:'PUBLIC'}}}},select:{id:true,authorId:true,title:true,region:true,rolesNeeded:true,expiresAt:true,author:{select:{id:true,displayName:true}}},orderBy:{createdAt:'desc'},take:50}).then(posts=>posts.map(({authorId,...post})=>({...post,isMine:authorId===viewerId})))}
