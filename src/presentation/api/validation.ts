import { z } from 'zod'

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(20),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(20),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export const CreateFocusTaskSchema = z.object({
  name: z.string().min(1).max(50),
  tagId: z.string().uuid(),
})

export const UpdateFocusTaskSchema = z.object({
  name: z.string().min(1).max(50),
  tagId: z.string().uuid(),
})
