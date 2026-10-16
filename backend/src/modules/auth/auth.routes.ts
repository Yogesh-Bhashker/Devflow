import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;