import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = res.locals.userId as number;

    // Create the project AND the owner's membership row together.
    // $transaction makes both succeed or both fail — never just one.
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: { name, description, ownerId }
      });

      await tx.projectMember.create({
        data: { projectId: newProject.id, userId: ownerId, role: "OWNER" }
      });

      return newProject;
    });

    res.status(201).json({ message: "Project created", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as number;

    // Show projects where the user has ANY membership row, not just ones they own
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        tasks: true,
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};