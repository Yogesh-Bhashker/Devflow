import { Router } from "express";
import { addMember, getMembers, removeMember } from "./member.controller";
import { requireProjectRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { addMemberSchema } from "./member.schema";

// mergeParams lets this router see :projectId from the parent route it's mounted under
const router = Router({ mergeParams: true });

router.get("/", getMembers);
router.post("/", requireProjectRole(["OWNER"]), validate(addMemberSchema), addMember);
router.delete("/:userId", requireProjectRole(["OWNER"]), removeMember);

export default router;