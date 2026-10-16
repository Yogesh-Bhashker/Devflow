import prisma from "./prisma";
import { emitToUser } from "./socket";

type NotificationType = "TASK_ASSIGNED" | "TASK_UPDATED" | "MEMBER_ADDED";

export async function notify(params: {
  userId: number;
  type: NotificationType;
  message: string;
  projectId?: number;
  taskId?: number;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
      projectId: params.projectId,
      taskId: params.taskId,
    },
  });

  console.log(`notify: saved notification ${notification.id} for user ${params.userId}`);
  await emitToUser(params.userId, "notification:new", notification);
  return notification;
}