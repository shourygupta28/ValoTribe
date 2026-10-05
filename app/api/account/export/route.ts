import {currentUser} from '../../../../lib/auth';
import {db} from '../../../../lib/db';
import {json} from '../../../../lib/http';
export async function GET(){
 const user=await currentUser();if(!user)return json({error:'Sign in required.'},401);
 const [posts,blocks,reports,riotLink]=await Promise.all([db.lFGPost.findMany({where:{authorId:user.id}}),db.block.findMany({where:{blockerId:user.id},select:{blockedId:true,createdAt:true}}),db.report.findMany({where:{reporterId:user.id},select:{subjectId:true,reason:true,status:true,createdAt:true}}),db.riotLink.findUnique({where:{userId:user.id},include:{matches:true}})]);
 return Response.json({exportedAt:new Date(),account:{id:user.id,displayName:user.displayName,email:user.email,emailVerifiedAt:user.emailVerifiedAt,suspendedAt:user.suspendedAt,createdAt:user.createdAt,termsAcceptedAt:user.termsAcceptedAt,policyVersion:user.policyVersion},passport:user.passport,posts,blocks,reports,riotLink},{headers:{'Cache-Control':'private, no-store','Content-Disposition':'attachment; filename="valotribe-data.json"'}});
}
