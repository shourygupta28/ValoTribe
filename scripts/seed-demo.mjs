import nextEnv from '@next/env';
import {PrismaClient} from '@prisma/client';
import {DEMO_ACCOUNTS,DEMO_PASSWORD,seedDemoAccounts} from './demo-data.mjs';

nextEnv.loadEnvConfig(process.cwd());
try{
 const url=new URL(process.env.DATABASE_URL);
 if(process.env.NODE_ENV==='production'||!['localhost','127.0.0.1','[::1]','db'].includes(url.hostname)){
  throw new Error('Demo accounts are for local testing. Use a local development database and run outside production.');
 }
 const db=new PrismaClient();
 try{
  const created=await seedDemoAccounts(db);
  console.log(`Created ${created} demo accounts; existing demo accounts were preserved.`);
  for(const account of DEMO_ACCOUNTS)console.log(account.email);
  console.log(`Initial password for all demo accounts: ${DEMO_PASSWORD}`);
  console.log('Sign in normally at /. Sample LFG posts expire after 24 hours.');
 }finally{await db.$disconnect()}
}catch(error){
 console.error(error instanceof Error?error.message:'Demo seeding failed.');
 process.exitCode=1;
}
