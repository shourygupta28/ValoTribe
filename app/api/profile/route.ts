import {db} from '../../../lib/db';
import {currentUser} from '../../../lib/auth';
import {input,json,failure} from '../../../lib/http';
import {POLICY_VERSION} from '../../../lib/config';
import {profileInput} from '../../../lib/validation';
export async function GET(){const user=await currentUser();if(!user)return json({error:'Sign in required.'},401);return json({displayName:user.displayName,emailVerified:!!user.emailVerifiedAt,passport:user.passport})}
export async function PUT(request:Request){try{const body=await input(request);const user=await currentUser();if(!user)return json({error:'Sign in required.'},401);if(!user.emailVerifiedAt&&(body.visibility==='PUBLIC'||body.discoveryOptIn))return json({error:'Verify your email before sharing your Passport.'},403);if((body.visibility==='PUBLIC'||body.discoveryOptIn)&&user.policyVersion!==POLICY_VERSION)return json({error:'Review and accept the current policies in Settings before sharing.'},403);const {displayName,...passport}=profileInput(body);await db.$transaction([db.user.update({where:{id:user.id},data:{displayName}}),db.passport.upsert({where:{userId:user.id},create:{userId:user.id,...passport},update:passport})]);return json({ok:true})}catch(error){return failure(error)}}
