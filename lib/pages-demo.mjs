export const DEMO_EMAIL = 'valotribe@email.com';
export const DEMO_PASSWORD = 'valotribe';

// Public fictional credentials for the static preview, never a server account.
export function demoLogin(email, password) {
  return typeof email === 'string' && email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export const demoProfile = {
  id:'pages-demo', puuid:'', name:'Demo Initiator', tag:'Fictional',
  rank:'Diamond', roles:['Initiator'], agents:['Sova','Fade'],
  languages:['Hindi','English'], start:1260, end:60, intent:'Competitive',
  optedIn:true, visibility:'PUBLIC',
};

export const demoTeammates = [
  {...demoProfile,id:'demo-controller',name:'Demo Controller',roles:['Controller'],agents:['Omen','Clove'],start:1230},
  {...demoProfile,id:'demo-duelist',name:'Demo Duelist',rank:'Platinum',roles:['Duelist'],agents:['Jett','Raze'],start:1200,end:1440},
  {...demoProfile,id:'demo-sentinel',name:'Demo Sentinel',roles:['Sentinel'],agents:['Killjoy','Cypher'],languages:['English','Tamil'],start:1320,end:120},
];
