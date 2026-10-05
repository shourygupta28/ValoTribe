import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoLogin,demoProfile,demoTeammates} from '../lib/pages-demo.mjs';
import {compatibility} from '../lib/compatibility.mjs';

test('static login accepts the requested demo credentials and normalized email',()=>{
 assert.equal(demoLogin('valotribe@email.com','valotribe'),true);
 assert.equal(demoLogin(' VALOTRIBE@EMAIL.COM ','valotribe'),true);
});
test('static login rejects incorrect credentials and malformed inputs',()=>{
 for(const [email,password] of [['other@email.com','valotribe'],['valotribe@email.com','wrong'],['valotribe@email.com',''],[null,'valotribe'],['valotribe@email.com',null]]){
  assert.equal(demoLogin(email,password),false);
 }
});
test('dashboard fictional teammates produce valid preference matches',()=>{
 for(const teammate of demoTeammates){const match=compatibility(demoProfile,teammate);assert.ok(match.score>=0&&match.score<=100);assert.ok(match.overlap>=0);assert.ok(match.factors.length>0)}
});
