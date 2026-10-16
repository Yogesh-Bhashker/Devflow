import { Router } from "express";
import { getUsers, getMe } from "./user.controller";

const router = Router();

router.get("/me", getMe);
router.get("/", getUsers);

export default router;