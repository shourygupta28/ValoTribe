import test from 'node:test';
import assert from 'node:assert/strict';
import {compatibility,discover} from '../lib/compatibility.mjs';
const v={id:'v',roles:['Initiator'],languages:['Hindi'],start:1260,end:1440,intent:'Competitive'};
const p={id:'p',roles:['Controller'],languages:['Hindi'],start:1260,end:1440,intent:'Competitive',optedIn:true,visibility:'PUBLIC'};
test('complementary preferences have transparent full fit',()=>{const r=compatibility(v,p);assert.equal(r.score,100);assert.equal(r.overlap,180);assert.equal(r.factors.reduce((s,f)=>s+f.weight*f.value,0),r.score)});
test('no overlap or shared language removes respective points',()=>assert.equal(compatibility(v,{...p,languages:['French'],start:300,end:400}).score,50));
test('discovery excludes private, unconsented and own records',()=>assert.deepEqual(discover(v,[p,{...p,id:'private',visibility:'PRIVATE'},{...p,id:'no',optedIn:false},{...p,id:'v'}]).map(r=>r.player.id),['p']));
test('role filter applies before ranking',()=>assert.equal(discover(v,[p],'Sentinel').length,0));
