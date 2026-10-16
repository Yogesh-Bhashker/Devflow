import { z } from "zod";

const statusEnum = z.enum(["todo", "in-progress", "done"]);

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  projectId: z.coerce
    .number({ required_error: "projectId is required" })
    .int("projectId must be an integer")
    .positive("projectId must be a positive number"),
  assigneeId: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
  status: statusEnum.optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  status: statusEnum.optional(),
  assigneeId: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;