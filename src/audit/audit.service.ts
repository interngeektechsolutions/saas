async log(data:{
  businessId:string;
  userId:string;
  action:string;
  entity:string;
  entityId?:string;
})
{
  return this.prisma.auditLog.create({
    data,});
}
