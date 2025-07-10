import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { users, memos } from './schema';
import { z } from 'zod';

const omitKeysOnSave = {
  id: true,
  createdAt: true,
  updatedAt: true,
} as const;

const CreateUserSchema = createInsertSchema(users).omit(omitKeysOnSave);
const UpdateUserSchema = createUpdateSchema(users).omit(omitKeysOnSave);
const SelectUserSchema = createSelectSchema(users);

type CreateUserInput = z.infer<typeof CreateUserSchema>;
type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
type SelectUserInput = z.infer<typeof SelectUserSchema>;

const CreateMemoSchema = createInsertSchema(memos).omit(omitKeysOnSave);
const UpdateMemoSchema = createUpdateSchema(memos).omit(omitKeysOnSave);
const SelectMemoSchema = createSelectSchema(memos);

type CreateMemoInput = z.infer<typeof CreateMemoSchema>;
type UpdateMemoInput = z.infer<typeof UpdateMemoSchema>;
type SelectMemoInput = z.infer<typeof SelectMemoSchema>;

export {
  CreateUserInput,
  UpdateUserInput,
  SelectUserInput,
  CreateMemoInput,
  UpdateMemoInput,
  SelectMemoInput
}