import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

type AllowedRole = "OWNER" | "MEMBER" | "VIEWER";

export const requireProjectRole = (allowedRoles: AllowedRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.userId as number;
      const projectId = Number(req.params.projectId || req.body.projectId);

      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }

      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } }
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: "You don't have permission to do this" });
      }

      res.locals.role = membership.role;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
};


export const requireTaskProjectRole = (allowedRoles: AllowedRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.userId as number;
      const taskId = Number(req.params.id);

      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId } }
      });

      if (!membership || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: "You don't have permission to do this" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
};