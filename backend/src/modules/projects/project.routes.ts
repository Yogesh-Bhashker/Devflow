import { Router } from "express";
import { createProject, getProjects } from "./project.controller";
import { validate } from "../../middleware/validate.middleware";
import { createProjectSchema } from "./project.schema";

const router = Router();

router.get("/", getProjects);
router.post("/", validate(createProjectSchema), createProject);

export default router;