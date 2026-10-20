export async function cleanDatabase() {
  const { default: prisma } = await import("../lib/prisma");

  // Order matters — child tables first (foreign key constraints)
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}