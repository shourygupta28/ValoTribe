import {PrismaClient} from '@prisma/client';
const db=new PrismaClient();
try{const now=new Date();const counts=await db.$transaction([db.session.deleteMany({where:{expiresAt:{lte:now}}}),db.authAttempt.deleteMany({where:{expiresAt:{lte:now}}}),db.accountToken.deleteMany({where:{expiresAt:{lte:now}}}),db.lFGPost.deleteMany({where:{expiresAt:{lte:now}}}),db.report.deleteMany({where:{createdAt:{lt:new Date(Date.now()-90*86400000)}}})]);console.log('Cleanup completed:',counts.map(x=>x.count))}finally{await db.$disconnect()}
