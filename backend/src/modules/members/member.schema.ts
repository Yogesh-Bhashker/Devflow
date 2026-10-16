import { z } from "zod";

export const addMemberSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  role: z.enum(["OWNER", "MEMBER", "VIEWER"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be OWNER, MEMBER or VIEWER",
  }),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;