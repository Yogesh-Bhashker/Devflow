import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;
    const id = Number(req.params.id);

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });

    res.json({ message: "Marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    res.json({ message: "All marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};