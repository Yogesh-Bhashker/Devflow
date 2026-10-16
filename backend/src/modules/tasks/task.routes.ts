import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from "./task.controller";
import { requireProjectRole, requireTaskProjectRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "./task.schema";

const router = Router();

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post(
  "/",
  requireProjectRole(["OWNER", "MEMBER"]),
  validate(createTaskSchema),
  createTask
);
router.put(
  "/:id",
  requireTaskProjectRole(["OWNER", "MEMBER"]),
  validate(updateTaskSchema),
  updateTask
);
router.delete("/:id", requireTaskProjectRole(["OWNER", "MEMBER"]), deleteTask);

export default router;