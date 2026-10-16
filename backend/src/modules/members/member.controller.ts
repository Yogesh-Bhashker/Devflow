import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { notify } from "../../lib/notify";

export const addMember = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const { email, role } = req.body;

    if (!email || !["MEMBER", "VIEWER", "OWNER"].includes(role)) {
      return res.status(400).json({ message: "A valid email and role are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const membership = await prisma.projectMember.create({
      data: { projectId, userId: user.id, role }
    });

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    await notify({
      userId: user.id,
      type: "MEMBER_ADDED",
      message: `You were added to "${project?.name}" as ${role}`,
      projectId
    });

    res.status(201).json({ message: "Member added", membership });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "This user is already a member of the project" });
    }
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const memberUserId = Number(req.params.userId);

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: memberUserId } }
    });

    if (!membership) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (membership.role === "OWNER") {
      return res.status(400).json({ message: "Cannot remove the project owner" });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberUserId } }
    });

    res.json({ message: "Member removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};