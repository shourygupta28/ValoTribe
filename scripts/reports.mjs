import {PrismaClient} from '@prisma/client';
const db=new PrismaClient();
try{
 const [action,id]=process.argv.slice(2);
 if(action==='resolve'&&id)await db.report.update({where:{id},data:{status:'RESOLVED'}});
 else if(action==='suspend'&&id)await db.$transaction([db.user.update({where:{id},data:{suspendedAt:new Date()}}),db.passport.updateMany({where:{userId:id},data:{visibility:'PRIVATE',discoveryOptIn:false}}),db.session.deleteMany({where:{userId:id}})]);
 else if(action==='resume'&&id)await db.user.update({where:{id},data:{suspendedAt:null}});
 else console.log(JSON.stringify(await db.report.findMany({where:{status:'OPEN'},select:{id:true,subjectId:true,reason:true,createdAt:true},orderBy:{createdAt:'asc'},take:100}),null,2));
}finally{await db.$disconnect()}
