import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword} from '../lib/security.mjs';
import {compatibility} from '../lib/compatibility.mjs';
test('password hashes are salted and reject wrong passwords',async()=>{const a=await hashPassword('test-password-2026!'),b=await hashPassword('test-password-2026!');assert.notEqual(a,b);assert.ok(await verifyPassword('test-password-2026!',a));assert.equal(await verifyPassword('incorrect-password',a),false)});
test('overnight windows overlap on both sides of midnight',()=>{const p={roles:['Controller'],languages:['Hindi'],start:1260,end:60,intent:'Competitive'};assert.equal(compatibility(p,{...p,start:1320,end:120}).overlap,180);assert.equal(compatibility(p,{...p,start:120,end:300}).overlap,0)});
