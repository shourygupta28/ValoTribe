import {currentUser} from '../../../lib/auth';
import {publicPlayers,asPlayer} from '../../../lib/players';
import {discover} from '../../../lib/compatibility.mjs';
import {json} from '../../../lib/http';
export async function GET(){const user=await currentUser();if(!user)return json({error:'Sign in required.'},401);if(!user.emailVerifiedAt)return json({error:'Verify your email first.'},403);if(!user.passport?.onboarded)return json({error:'Complete onboarding.'},403);return json(discover(asPlayer({...user.passport,user}),await publicPlayers(user.id)))}
