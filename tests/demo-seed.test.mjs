import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {PGLiteSocketServer} from '@electric-sql/pglite-socket';
import {PrismaClient} from '@prisma/client';
import {DEMO_ACCOUNTS,DEMO_PASSWORD,seedDemoAccounts} from '../scripts/demo-data.mjs';
import {verifyPassword} from '../lib/security.mjs';

test('demo seed creates usable fixtures and preserves test edits and unrelated users',async()=>{
 const database=await PGlite.create();
 let server,db;
 try{
  for(const migration of (await readdir('prisma/migrations')).filter(x=>x!=='migration_lock.toml').sort()){
   await database.exec(await readFile(`prisma/migrations/${migration}/migration.sql`,'utf8'));
  }
  server=new PGLiteSocketServer({db:database,port:0,host:'127.0.0.1'});
  await server.start();
  db=new PrismaClient({datasourceUrl:`postgresql://postgres:postgres@${server.getServerConn()}/postgres?connection_limit=1&statement_cache_size=0&sslmode=disable`});
  const unrelated=await db.user.create({data:{displayName:'Existing user',email:'existing@example.test'}});
  assert.equal(await seedDemoAccounts(db),7);
  const accounts=await db.user.findMany({where:{id:{in:DEMO_ACCOUNTS.map(x=>x.id)}},include:{passport:true}});
  for(const account of accounts){
   assert.ok(await verifyPassword(DEMO_PASSWORD,account.passwordHash));
   assert.ok(account.termsAcceptedAt);
   assert.equal(account.policyVersion,'2026-10-03');
  }
  assert.equal(accounts.filter(x=>x.passport.visibility==='PUBLIC'&&x.passport.discoveryOptIn&&x.passport.onboarded&&x.emailVerifiedAt).length,4);
  const find=key=>accounts.find(x=>x.id===`valotribe-demo-${key}`);
  assert.equal(find('unverified').emailVerifiedAt,null);
  assert.equal(find('private').passport.visibility,'PRIVATE');
  assert.equal(find('new').passport.onboarded,false);
  const posts=await db.lFGPost.findMany();
  assert.equal(posts.length,4);
  assert.ok(posts.every(x=>x.expiresAt>new Date()&&x.region==='Mumbai'));
  assert.equal(await db.riotLink.count(),0);
  await db.user.update({where:{id:find('controller').id},data:{displayName:'Edited name',passwordHash:'changed',passport:{update:{visibility:'PRIVATE',discoveryOptIn:false}}}});
  await db.lFGPost.delete({where:{id:posts[0].id}});
  assert.equal(await seedDemoAccounts(db),0);
  const edited=await db.user.findUnique({where:{id:find('controller').id},include:{passport:true}});
  assert.equal(edited.displayName,'Edited name');
  assert.equal(edited.passwordHash,'changed');
  assert.equal(edited.passport.visibility,'PRIVATE');
  assert.equal(await db.lFGPost.count(),3);
  assert.deepEqual(await db.user.findUnique({where:{id:unrelated.id}}),unrelated);
  await db.user.delete({where:{id:find('new').id}});
  assert.equal(await seedDemoAccounts(db),1);
  // A conflicting non-demo email must abort all creation in this run.
  await db.user.delete({where:{id:find('controller').id}});
  await db.user.delete({where:{id:find('duelist').id}});
  await db.user.create({data:{displayName:'Collision',email:find('duelist').email}});
  await assert.rejects(seedDemoAccounts(db),/identifier collision/);
  assert.equal(await db.user.findUnique({where:{id:find('controller').id}}),null);
 }finally{
  if(db)await db.$disconnect();
  if(server)await server.stop();
  await database.close();
 }
});
