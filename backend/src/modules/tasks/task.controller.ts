import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { emitToProject } from "../../lib/socket";
import { notify } from "../../lib/notify";

export const createTask = async (req: Request, res: Response) => {
  try {
    // Validation handled by Zod in task.routes.ts
    const { title, description, projectId, assigneeId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId,
        assigneeId: assigneeId ?? null,
      },
    });

    emitToProject(projectId, "task:created", task);

    if (assigneeId) {
      await notify({
        userId: assigneeId,
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${task.title}"`,
        projectId,
        taskId: task.id,
      });
    }

    res.status(201).json({ message: "Task created", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;
    const tasks = await prisma.task.findMany({
      where: { project: { members: { some: { userId } } } },
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;
    const task = await prisma.task.findFirst({
      where: { id: Number(req.params.id), project: { members: { some: { userId } } } },
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    // Validation handled by Zod in task.routes.ts
    const { title, description, status, assigneeId } = req.body;
    const actingUserId = res.locals.userId as number;

    const before = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
    });

    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        description,
        status,
        assigneeId:
          assigneeId !== undefined ? (assigneeId ? Number(assigneeId) : null) : undefined,
      },
    });

    emitToProject(task.projectId, "task:updated", task);

    // New assignee got assigned just now
    if (assigneeId && before?.assigneeId !== Number(assigneeId)) {
      await notify({
        userId: Number(assigneeId),
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${task.title}"`,
        projectId: task.projectId,
        taskId: task.id,
      });
    }
    // Existing assignee gets notified of an update (but not the person who made the change)
    else if (task.assigneeId && task.assigneeId !== actingUserId) {
      await notify({
        userId: task.assigneeId,
        type: "TASK_UPDATED",
        message: `"${task.title}" was updated`,
        projectId: task.projectId,
        taskId: task.id,
      });
    }

    res.json({ message: "Task updated", task });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Task not found" });
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.delete({ where: { id: Number(req.params.id) } });
    emitToProject(task.projectId, "task:deleted", {
      id: task.id,
      projectId: task.projectId,
    });
    res.json({ message: "Task deleted" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Task not found" });
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};