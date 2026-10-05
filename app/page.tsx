import {currentUser} from '../lib/auth';
import {publicPlayers,asPlayer,feed} from '../lib/players';
import {discover} from '../lib/compatibility.mjs';
import {signupReady,POLICY_VERSION} from '../lib/config';
import Workspace from './live-workspace';
export const dynamic='force-dynamic';
export default async function Page(){
 if(!process.env.DATABASE_URL||!process.env.APP_ORIGIN)return <main className="setup"><h1>Valo<em>Tribe</em></h1><h2>Connect your database to start.</h2><p>The account service is not configured yet.</p><a href="/review">Open reviewer guide</a> · <a href="/demo">Explore the fictional demo</a></main>;
 const user=await currentUser();if(!user)return <Workspace signupEnabled={signupReady()} viewer={null} results={[]} posts={[]}/>;
 const viewer=user.passport?asPlayer({...user.passport,user}):null;
 return <Workspace signupEnabled={signupReady()} viewer={viewer} emailVerified={!!user.emailVerifiedAt} policyAccepted={user.policyVersion===POLICY_VERSION} profile={user.passport?{visibility:user.passport.visibility,discoveryOptIn:user.passport.discoveryOptIn,onboarded:user.passport.onboarded}:undefined} results={user.emailVerifiedAt&&user.passport?.onboarded&&viewer?discover(viewer,await publicPlayers(user.id)):[]} posts={user.emailVerifiedAt&&user.passport?.onboarded?await feed(user.id):[]}/>;
}
